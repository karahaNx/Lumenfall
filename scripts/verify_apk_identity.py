#!/usr/bin/env python3
import argparse
import re
import subprocess
import tempfile
import zipfile
from pathlib import Path


class VerificationError(RuntimeError):
    pass


def normalize_sha256(value: str) -> str:
    normalized = re.sub(r"[^0-9A-Fa-f]", "", value or "").upper()
    if len(normalized) != 64:
        raise VerificationError("certificate SHA-256 fingerprint is malformed")
    return normalized


def format_sha256(value: str) -> str:
    normalized = normalize_sha256(value)
    return ":".join(normalized[i:i + 2] for i in range(0, 64, 2))


def validate_apk_file(path: Path) -> None:
    if not path.is_file():
        raise VerificationError(f"APK is missing: {path}")
    if path.stat().st_size <= 0:
        raise VerificationError(f"APK is empty: {path}")
    if not zipfile.is_zipfile(path):
        raise VerificationError(f"APK is not a readable ZIP/APK container: {path}")


def parse_badging(output: str) -> dict:
    package_line = next((line for line in output.splitlines() if line.startswith("package:")), None)
    if not package_line:
        raise VerificationError("aapt output did not contain a package line")

    def field(name: str) -> str:
        match = re.search(rf"\\b{name}='([^']*)'", package_line)
        if not match:
            raise VerificationError(f"aapt package line did not contain {name}")
        return match.group(1)

    return {
        "package_id": field("name"),
        "version_code": field("versionCode"),
        "version_name": field("versionName"),
    }


def parse_apksigner_certificates(output: str) -> list[str]:
    matches = re.findall(
        r"certificate SHA-256 digest:\\s*([0-9A-Fa-f:]+)",
        output,
        flags=re.IGNORECASE,
    )
    if not matches:
        raise VerificationError("apksigner output did not contain a certificate SHA-256 digest")
    normalized = sorted(set(normalize_sha256(value) for value in matches))
    if len(normalized) != 1:
        raise VerificationError("APK contains multiple distinct signing certificate identities")
    return normalized


def assert_identity(metadata, certificates, expected_package, expected_version_code, expected_version_name, expected_cert_sha256):
    expected_cert = normalize_sha256(expected_cert_sha256)
    if metadata["package_id"] != expected_package:
        raise VerificationError(f"package ID mismatch: expected {expected_package}, got {metadata['package_id']}")
    if str(metadata["version_code"]) != str(expected_version_code):
        raise VerificationError(f"versionCode mismatch: expected {expected_version_code}, got {metadata['version_code']}")
    if metadata["version_name"] != expected_version_name:
        raise VerificationError(f"versionName mismatch: expected {expected_version_name}, got {metadata['version_name']}")
    if certificates != [expected_cert]:
        actual = ", ".join(format_sha256(value) for value in certificates)
        raise VerificationError(f"signing certificate mismatch: expected {format_sha256(expected_cert)}, got {actual}")


def run_tool(command, label):
    try:
        completed = subprocess.run(command, capture_output=True, text=True, check=False)
    except FileNotFoundError as exc:
        raise VerificationError(f"{label} tool is unavailable: {command[0]}") from exc
    if completed.returncode != 0:
        detail = (completed.stderr or completed.stdout or "").strip()
        if len(detail) > 1200:
            detail = detail[-1200:]
        raise VerificationError(f"{label} failed with exit code {completed.returncode}" + (f": {detail}" if detail else ""))
    return (completed.stdout or "") + ("\\n" + completed.stderr if completed.stderr else "")


def verify_apk(apk, aapt, apksigner, expected_package, expected_version_code, expected_version_name, expected_cert_sha256):
    validate_apk_file(apk)
    metadata = parse_badging(run_tool([aapt, "dump", "badging", str(apk)], "aapt"))
    certificates = parse_apksigner_certificates(run_tool([apksigner, "verify", "--verbose", "--print-certs", str(apk)], "apksigner"))
    assert_identity(metadata, certificates, expected_package, expected_version_code, expected_version_name, expected_cert_sha256)
    return {**metadata, "certificate_sha256": format_sha256(certificates[0])}


def expect_failure(label, func):
    try:
        func()
    except VerificationError:
        return
    raise AssertionError(f"self-test expected failure but passed: {label}")


def self_test():
    expected_cert = "A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21"
    good_badging = "package: name='com.lumenfall.app' versionCode='123' versionName='0.1.123' compileSdkVersion='35'\\n"
    good_signer = "Signer #1 certificate SHA-256 digest: a91cbf3427d2ceb1cdbe07e5225f17d471b1829e52f7ab66497e754975ad3e21\\n"
    metadata = parse_badging(good_badging)
    certificates = parse_apksigner_certificates(good_signer)
    assert_identity(metadata, certificates, "com.lumenfall.app", "123", "0.1.123", expected_cert)

    with tempfile.TemporaryDirectory(prefix="lumenfall-apk-verify-selftest-") as td:
        root = Path(td)
        expect_failure("missing APK", lambda: validate_apk_file(root / "missing.apk"))
        empty = root / "empty.apk"
        empty.write_bytes(b"")
        expect_failure("empty APK", lambda: validate_apk_file(empty))
        invalid = root / "invalid.apk"
        invalid.write_bytes(b"not an apk")
        expect_failure("invalid APK", lambda: validate_apk_file(invalid))

    expect_failure("wrong package ID", lambda: assert_identity({**metadata, "package_id": "com.example.wrong"}, certificates, "com.lumenfall.app", "123", "0.1.123", expected_cert))
    expect_failure("wrong versionCode", lambda: assert_identity({**metadata, "version_code": "124"}, certificates, "com.lumenfall.app", "123", "0.1.123", expected_cert))
    expect_failure("wrong versionName", lambda: assert_identity({**metadata, "version_name": "9.9.9"}, certificates, "com.lumenfall.app", "123", "0.1.123", expected_cert))
    expect_failure("wrong certificate", lambda: assert_identity(metadata, ["00" * 32], "com.lumenfall.app", "123", "0.1.123", expected_cert))
    expect_failure("malformed aapt output", lambda: parse_badging("no package here"))
    expect_failure("malformed apksigner output", lambda: parse_apksigner_certificates("Verified"))
    print("APK identity verifier self-test passed: missing/invalid APK and all identity mismatch cases were rejected.")


def main():
    parser = argparse.ArgumentParser(description="Verify the exact Lumenfall APK before publication.")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--apk")
    parser.add_argument("--aapt")
    parser.add_argument("--apksigner")
    parser.add_argument("--expected-package")
    parser.add_argument("--expected-version-code")
    parser.add_argument("--expected-version-name")
    parser.add_argument("--expected-cert-sha256")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return 0

    required = {
        "--apk": args.apk,
        "--aapt": args.aapt,
        "--apksigner": args.apksigner,
        "--expected-package": args.expected_package,
        "--expected-version-code": args.expected_version_code,
        "--expected-version-name": args.expected_version_name,
        "--expected-cert-sha256": args.expected_cert_sha256,
    }
    missing = [name for name, value in required.items() if not value]
    if missing:
        parser.error("missing required arguments: " + ", ".join(missing))

    try:
        result = verify_apk(Path(args.apk), args.aapt, args.apksigner, args.expected_package, args.expected_version_code, args.expected_version_name, args.expected_cert_sha256)
    except VerificationError as exc:
        print(f"APK identity verification failed: {exc}", file=__import__("sys").stderr)
        return 1

    print("Verified final APK identity:")
    print(f"  packageId: {result['package_id']}")
    print(f"  versionCode: {result['version_code']} (expected {args.expected_version_code})")
    print(f"  versionName: {result['version_name']} (expected {args.expected_version_name})")
    print(f"  certificate SHA-256: {result['certificate_sha256']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
