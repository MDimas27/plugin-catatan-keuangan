import requests
import re

NGROK_URL = "https://7071-101-255-150-125.ngrok-free.app"  # Ganti dengan URL ngrok kamu

def prompt_to_api_command(prompt):
    prompt = prompt.lower()

    if "saldo" in prompt or "berapa uang" in prompt:
        return {
            "method": "GET",
            "url": f"{NGROK_URL}/balance"
        }

    match = re.match(r"catat (pengeluaran|pemasukan) (\d+)(?: (?:untuk|dari) (.+))?", prompt)
    if match:
        jenis, jumlah, deskripsi = match.groups()
        return {
            "method": "POST",
            "url": f"{NGROK_URL}/transactions",
            "json": {
                "type": "expense" if jenis == "pengeluaran" else "income",
                "amount": float(jumlah),
                "description": deskripsi or ""
            }
        }

    if "lihat semua" in prompt or "transaksi" in prompt:
        return {
            "method": "GET",
            "url": f"{NGROK_URL}/transactions"
        }

    return None

def call_plugin_api(command):
    try:
        if command["method"] == "GET":
            response = requests.get(command["url"])
        elif command["method"] == "POST":
            response = requests.post(command["url"], json=command["json"])
        else:
            return "❌ Method tidak dikenali"

        if response.status_code in [200, 201]:
            return response.json()
        else:
            return f"❌ Error {response.status_code}: {response.text}"
    except Exception as e:
        return f"❌ Gagal menghubungi plugin: {e}"

def main():
    print("🧾 Simulasi Plugin Catatan Keuangan (tanpa OpenAI API)")
    while True:
        user_input = input("💬 Prompt (atau 'exit'): ").strip()
        if user_input.lower() == "exit":
            break

        command = prompt_to_api_command(user_input)
        if not command:
            print("🤖 Maaf, prompt tidak dikenali.")
            continue

        result = call_plugin_api(command)
        print("📡 Respons dari plugin:", result)

if __name__ == "__main__":
    main()
