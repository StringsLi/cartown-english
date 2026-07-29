param(
  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;
using System.Runtime.InteropServices;

public static class WechatWindowCapture {
  [StructLayout(LayoutKind.Sequential)]
  public struct RECT {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }

  [DllImport("user32.dll")]
  public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);

  [DllImport("user32.dll")]
  public static extern bool PrintWindow(IntPtr hWnd, IntPtr hdc, uint flags);

  [DllImport("user32.dll")]
  public static extern uint GetDpiForWindow(IntPtr hWnd);

  [DllImport("user32.dll")]
  public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

  [DllImport("user32.dll")]
  public static extern bool SetForegroundWindow(IntPtr hWnd);

  [DllImport("user32.dll")]
  public static extern bool RedrawWindow(IntPtr hWnd, IntPtr updateRect, IntPtr updateRegion, uint flags);
}
'@

$devtools = Get-Process wechatdevtools -ErrorAction Stop |
  Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like "*Stable*" } |
  Select-Object -First 1

if (-not $devtools) {
  throw "WeChat DevTools project window was not found."
}

[WechatWindowCapture]::ShowWindow($devtools.MainWindowHandle, 9) | Out-Null
[WechatWindowCapture]::SetForegroundWindow($devtools.MainWindowHandle) | Out-Null
[WechatWindowCapture]::RedrawWindow($devtools.MainWindowHandle, [IntPtr]::Zero, [IntPtr]::Zero, 0x0181) | Out-Null
Start-Sleep -Milliseconds 350

$rect = New-Object WechatWindowCapture+RECT
[WechatWindowCapture]::GetWindowRect($devtools.MainWindowHandle, [ref]$rect) | Out-Null
$scale = [WechatWindowCapture]::GetDpiForWindow($devtools.MainWindowHandle) / 96.0
$width = [int](($rect.Right - $rect.Left) * $scale)
$height = [int](($rect.Bottom - $rect.Top) * $scale)

$windowBitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($windowBitmap)
$hdc = $graphics.GetHdc()
[WechatWindowCapture]::PrintWindow($devtools.MainWindowHandle, $hdc, 2) | Out-Null
$graphics.ReleaseHdc($hdc)
$graphics.Dispose()

# The simulator pane keeps this relative position in the project's three-column layout.
$crop = New-Object System.Drawing.Rectangle(
  [int]($width * 0.556),
  [int]($height * 0.091),
  [int]($width * 0.290),
  [int]($height * 0.787)
)
$simulatorBitmap = $windowBitmap.Clone($crop, $windowBitmap.PixelFormat)
$windowBitmap.Dispose()

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
$outputDirectory = [System.IO.Path]::GetDirectoryName($resolvedOutput)
[System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null
$simulatorBitmap.Save($resolvedOutput, [System.Drawing.Imaging.ImageFormat]::Png)
$simulatorBitmap.Dispose()

Write-Output $resolvedOutput
