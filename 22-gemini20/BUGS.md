On my Mac, something happens to the compiled version:

## P4 b/02

the JSOn contains full paths which is incompatible with Mac/Linux:

* BAD: /usr/local/google/home/ricc/git/genai-googlecloud-scripts/22-gemini20/streamlit/generated_videos/video-Shrek_wakes_up_in_Turin_the_view_from_Shrek_to_the_Mole_Antonelliana_out_of_the_window_On_the_be-996c8765-b641-4fff-a30f-753279c294b0-1.mp4
* WANTED: streamlit/generated_videos/video-Shrek_wakes_up_in_Turin_the_view_from_Shrek_to_the_Mole_Antonelliana_out_of_the_window_On_the_be-996c8765-b641-4fff-a30f-753279c294b0-1.mp4

## BUG Compiled imagen

Funny thing is, starts creating generated pictures of an error prompt :)


```bash
(.venv) ricc@ricc-macbookpro3:🏡~/git/gic/bin/arch/myarchbin$ Traceback (most recent call last):
  File "imagen.py", line 4, in <module>
  File "PyInstaller/loader/pyimod02_importers.py", line 450, in exec_module
  File "PIL/Image.py", line 97, in <module>
ImportError: cannot import name '_imaging' from 'PIL' (/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/PIL/__init__.pyc)
[PYI-18003:ERROR] Failed to execute script 'imagen' due to unhandled exception!
💾 Saving image to: out/20250307_c_import_os_sys_time_timesleep20_osremovesysargv1_varfoldersml1t92vmgs3_j8xfcj_1.png
[PYI-18034:ERROR] Failed to load Python shared library '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python': dlopen: dlopen(/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python, 0x000A): tried: '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file)
💾 Saving image to: out/20250307_c_import_os_sys_time_timesleep20_osremovesysargv1_varfoldersml1t92vmgs3_j8xfcj_2.png
[PYI-18039:ERROR] Failed to load Python shared library '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python': dlopen: dlopen(/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python, 0x000A): tried: '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file)
💾 Saving image to: out/20250307_c_import_os_sys_time_timesleep20_osremovesysargv1_varfoldersml1t92vmgs3_j8xfcj_3.png
[PYI-18042:ERROR] Failed to load Python shared library '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python': dlopen: dlopen(/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python, 0x000A): tried: '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file)
💾 Saving image to: out/20250307_c_import_os_sys_time_timesleep20_osremovesysargv1_varfoldersml1t92vmgs3_j8xfcj_4.png
[PYI-18044:ERROR] Failed to load Python shared library '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python': dlopen: dlopen(/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python, 0x000A): tried: '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file)
💾 Saving image to: out/20250307_c_import_os_sys_time_timesleep20_osremovesysargv1_varfoldersml1t92vmgs3_j8xfcj_1.png
[PYI-18046:ERROR] Failed to load Python shared library '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python': dlopen: dlopen(/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python, 0x000A): tried: '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file)
💾 Saving image to: out/20250307_c_import_os_sys_time_timesleep20_osremovesysargv1_varfoldersml1t92vmgs3_j8xfcj_2.png
[PYI-18048:ERROR] Failed to load Python shared library '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python': dlopen: dlopen(/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python, 0x000A): tried: '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file)
💾 Saving image to: out/20250307_c_import_os_sys_time_timesleep20_osremovesysargv1_varfoldersml1t92vmgs3_j8xfcj_3.png
[PYI-18053:ERROR] Failed to load Python shared library '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python': dlopen: dlopen(/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python, 0x000A): tried: '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file)
💾 Saving image to: out/20250307_c_import_os_sys_time_timesleep20_osremovesysargv1_varfoldersml1t92vmgs3_j8xfcj_4.png
[PYI-18069:ERROR] Failed to load Python shared library '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python': dlopen: dlopen(/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python, 0x000A): tried: '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file)
💾 Saving image to: out/20250307_c_import_os_sys_time_timesleep20_osremovesysargv1_varfoldersml1t92vmgs3_j8xfcj_1.png
[PYI-18136:ERROR] Failed to load Python shared library '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python': dlopen: dlopen(/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python, 0x000A): tried: '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file)
💾 Saving image to: out/20250307_c_import_os_sys_time_timesleep20_osremovesysargv1_varfoldersml1t92vmgs3_j8xfcj_2.png
[PYI-18227:ERROR] Failed to load Python shared library '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python': dlopen: dlopen(/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python, 0x000A): tried: '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file)
💾 Saving image to: out/20250307_c_import_os_sys_time_timesleep20_osremovesysargv1_varfoldersml1t92vmgs3_j8xfcj_3.png
[PYI-18293:ERROR] Failed to load Python shared library '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python': dlopen: dlopen(/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python, 0x000A): tried: '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file)
💾 Saving image to: out/20250307_c_import_os_sys_time_timesleep20_osremovesysargv1_varfoldersml1t92vmgs3_j8xfcj_4.png
[PYI-18295:ERROR] Failed to load Python shared library '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python': dlopen: dlopen(/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python, 0x000A): tried: '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file), '/var/folders/ml/1t92vmgs3_j8xfcjnczvjwnr0050ys/T/_MEIsJmnyu/Python' (no such file)
```


## GCS issue on Mac

Error during video retrieval: Project was not passed and could not be determined from the environment.

