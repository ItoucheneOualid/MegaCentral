@echo off
cd C:\wamp\bin\mysql\mysql5.6.17\bin\
mysql.exe -u root idmegacentral < c:\Users\itouc\Desktop\MegaCentral\backend\sql\migration_normalize_to_class_diagram.sql
pause
