import argparse
import os
import requests

BACKEND_MASTER_TOKEN = os.environ["BACKEND_MASTER_TOKEN"]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("api")
    parser.add_argument("-c", "--count", type=int, default=1)
    args = parser.parse_args()

    api = args.api.strip("/")

    session = requests.Session()
    for i in range(args.count):
        resp = session.post(
            f"{api}/badges",
            headers={
                "accept": "application/json",
                "x-token": BACKEND_MASTER_TOKEN,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        print(data["id"])


if __name__ == "__main__":
    main()
