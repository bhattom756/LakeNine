import weaviate
import json
from weaviate.auth import AuthApiKey
from weaviate.classes.config import Property, DataType

with open("components.json", "r", encoding="utf-8") as f:
    components = json.load(f)


cluster_url="https://9unejkmcrws6qkhxj6gga.c0.asia-southeast1.gcp.weaviate.cloud"
api_key = "ck8yZjZOS3FIK3F2SVVXN19QaDU4T3o5SUdHQmx6bXZSZnIvNUp2UWhZemFmWG14OVVZTmdXSmR1T2IwPV92MjAw"

print(f"Attempting to connect to Weaviate at: {cluster_url}")
print(f"Using API key (first 10 chars): {api_key[:10]}...")
print(f"API key length: {len(api_key)}")

try:
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=cluster_url,
        auth_credentials=AuthApiKey(api_key),
        headers={
            "X-OpenAI-Api-Key": "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"
        }
    )
    print("✅ Successfully connected to Weaviate!")
    client.close()
    print("✅ conn closed!")

except Exception as e:
    print(f"❌ Failed to connect to Weaviate: {e}")
    exit(1)