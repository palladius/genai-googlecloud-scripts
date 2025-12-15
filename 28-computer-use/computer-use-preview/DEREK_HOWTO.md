# DEREK HOWTO: Setting up Playwright for Local Development

This document outlines the steps taken to resolve missing shared library dependencies for Playwright on a Linux system where `sudo` access is unavailable.

## Summary

The core issue was that `playwright install` and `playwright install-deps` failed because they require `sudo` to install system-wide dependencies. The solution was to manually download the required Debian packages, extract the shared libraries, and then use the `LD_LIBRARY_PATH` environment variable to point Playwright to these local libraries.

## Playwright Scripts

-   **Main Script:** `main.py` is the primary script that runs the computer use agent.
-   **Playwright Logic:** The core Playwright integration is located in `computers/playwright/playwright.py`.

## Dependencies

The following shared libraries were missing:

-   `libvpx.so.7`
-   `libavif.so.15`
-   `libdav1d.so.6`
-   `librav1e.so.0`
-   `libSvtAv1Enc.so.1`

These were manually downloaded as `.deb` packages and extracted.

### Location of Dependencies

The extracted libraries are located in: `~/.local/lib/usr/lib/x86_64-linux-gnu/`

## Automated Setup Script

The following script automates the entire process of downloading and extracting the necessary libraries.

```bash
#!/bin/bash

# Create a directory for the local libraries
mkdir -p ~/.local/lib

# Download and extract the required Debian packages
curl -O http://ftp.debian.org/debian/pool/main/libv/libvpx/libvpx7_1.12.0-1+deb12u4_amd64.deb
dpkg -x libvpx7_1.12.0-1+deb12u4_amd64.deb ~/.local/lib

curl -O http://ftp.de.debian.org/debian/pool/main/liba/libavif/libavif15_0.11.1-1+deb12u1_amd64.deb
dpkg -x libavif15_0.11.1-1+deb12u1_amd64.deb ~/.local/lib

curl -O http://ftp.debian.org/debian/pool/main/d/dav1d/libdav1d6_1.0.0-2+deb12u1_amd64.deb
dpkg -x libdav1d6_1.0.0-2+deb12u1_amd64.deb ~/.local/lib

curl -O http://ftp.debian.org/debian/pool/main/r/rust-rav1e/librav1e0_0.5.1-6_amd64.deb
dpkg -x librav1e0_0.5.1-6_amd64.deb ~/.local/lib

curl -O http://ftp.de.debian.org/debian/pool/main/s/svt-av1/libsvtav1enc1_1.4.1+dfsg-1_amd64.deb
dpkg -x libsvtav1enc1_1.4.1+dfsg-1_amd64.deb ~/.local/lib

# Clean up the downloaded .deb files
rm *.deb

echo "Playwright dependencies installed locally."
echo "You can now run Playwright scripts using the following command:"
echo 'LD_LIBRARY_PATH=~/.local/lib/usr/lib/x86_64-linux-gnu/ python main.py --query="Go to Google and type '\''Hello World'\''' into the search bar" --env="playwright"'

```

## How to Run

To run the main script with the locally installed dependencies, you must prepend the `LD_LIBRARY_PATH` to your command:

```bash
LD_LIBRARY_PATH=~/.local/lib/usr/lib/x86_64-linux-gnu/ python main.py --query="Go to Google and type 'Hello World' into the search bar" --env="playwright"
```
