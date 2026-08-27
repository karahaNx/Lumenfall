import os
import re
import pathlib

path = pathlib.Path("android/app/build.gradle")
content = path.read_text()

signing_block = """
    signingConfigs {
        release {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "release.keystore")
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }
    }
"""

if "signingConfigs" not in content:
    content = content.replace("android {", "android {\n" + signing_block, 1)

content, n = re.subn(
    r"(buildTypes\s*\{\s*release\s*\{)",
    r"\1\n            signingConfig signingConfigs.release",
    content,
    count=1,
)
if n == 0:
    raise SystemExit("could not find buildTypes { release { } } block to patch - Capacitor's Android template may have changed")

version_name = os.environ.get("LUMENFALL_VERSION_NAME")
version_code = os.environ.get("LUMENFALL_VERSION_CODE")
if version_name:
    content = re.sub(r'versionName\s+"[^"]*"', 'versionName "%s"' % version_name, content, count=1)
if version_code:
    content = re.sub(r"versionCode\s+\d+", "versionCode %s" % version_code, content, count=1)

path.write_text(content)
print("patched android/app/build.gradle: signing config added, versionName=%s versionCode=%s" % (version_name, version_code))
