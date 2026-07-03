#!/usr/bin/env python3
"""
Linux Course Starter – простой HTTP-сервер.
Запускает курс в браузере. Корректно работает и как скрипт, и как .exe.
"""
import http.server
import socketserver
import webbrowser
import os
import sys
import threading
import time

PORT = 8000

# Автоопределение корневой папки: для .exe - путь к .exe, для скрипта - путь к скрипту
if getattr(sys, 'frozen', False):
    # Запущено как скомпилированное приложение (PyInstaller)
    DIRECTORY = os.path.dirname(sys.executable)
else:
    # Обычный Python-скрипт
    DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class QuietHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Тихий режим: показываем только ошибки
        if len(args) > 0 and isinstance(args[0], int):
            status_code = args[0]
            if 400 <= status_code <= 599:
                sys.stderr.write(f"  [!] {args[1] if len(args) > 1 else format}\n")


def open_browser():
    time.sleep(1.5)
    url = f"http://localhost:{PORT}"
    print(f"\nОткрываю браузер: {url}\n")
    webbrowser.open(url)


def run_http_server():
    # Проверяем наличие index.html
    index_path = os.path.join(DIRECTORY, 'index.html')
    if not os.path.exists(index_path):
        print(f"❌ Ошибка: index.html не найден в {DIRECTORY}")
        print("Проверь, что файл лежит в корне папки с курсом.")
        input("Нажми Enter для выхода...")
        sys.exit(1)

    print("=" * 50)
    print("   🐧 Linux Administration Course")
    print("=" * 50)
    print(f"   Сервер запущен на http://localhost:{PORT}")
    print(f"   Папка с курсом: {DIRECTORY}")
    print("   Нажми Ctrl+C для остановки.\n")

    threading.Thread(target=open_browser, daemon=True).start()

    # Разрешаем повторное использование порта
    socketserver.TCPServer.allow_reuse_address = True

    try:
        with socketserver.TCPServer(("", PORT), QuietHTTPHandler) as httpd:
            httpd.serve_forever()
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Порт {PORT} уже занят!")
            print(f"Закрой другое приложение на порту {PORT} или измени PORT в скрипте.")
        else:
            print(f"❌ Ошибка: {e}")
        input("Нажми Enter для выхода...")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n✅ Сервер остановлен.")
        sys.exit(0)


if __name__ == "__main__":
    run_http_server()