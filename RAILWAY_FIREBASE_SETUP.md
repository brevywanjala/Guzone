# Firebase Admin SDK Setup for Railway

## Problem
When deploying to Railway, you get the error: **"Firebase Admin SDK not configured"**

This happens because Railway doesn't have access to your local `ServiceAccountKey.json` file.

## Solution: Set FIREBASE_CREDENTIALS_JSON Environment Variable

### Step 1: Get Your Service Account JSON Content

1. Open your `backend/ServiceAccountKey.json` file
2. Copy the **entire JSON content** (all lines)

### Step 2: Convert to Single-Line JSON String

You need to convert the multi-line JSON to a single-line string with escaped quotes. Here are two methods:

#### Method 1: Using Python (Recommended)

Run this command in your terminal (from the backend directory):

```bash
python -c "import json; print(json.dumps(json.load(open('ServiceAccountKey.json'))))"
```

This will output a single-line JSON string. Copy this entire output.

#### Method 2: Manual Conversion

1. Open `ServiceAccountKey.json`
2. Remove all line breaks and extra spaces
3. Escape any double quotes inside the JSON (though the service account JSON shouldn't have any)
4. The result should be one continuous line

**Example format:**
```
{"type":"service_account","project_id":"guzone-3b9c6","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",...}
```

### Step 3: Add to Railway Environment Variables

1. Go to your Railway project dashboard
2. Click on your service (backend)
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Set:
   - **Key**: `FIREBASE_CREDENTIALS_JSON`
   - **Value**: Paste the single-line JSON string you created in Step 2
6. Click **Add**

### Step 4: Redeploy

After adding the environment variable:
1. Railway will automatically redeploy, OR
2. Go to **Deployments** tab and click **Redeploy**

### Step 5: Verify

Check your Railway logs. You should see:
```
Firebase Admin SDK initialized from environment variable
```

## Alternative: Using FIREBASE_CREDENTIALS_PATH (Not Recommended for Railway)

If you prefer to use a file path instead:

1. Upload `ServiceAccountKey.json` to your Railway project
2. Set `FIREBASE_CREDENTIALS_PATH` environment variable to the file path
3. **Note**: This is less secure and not recommended for cloud deployments

## Troubleshooting

### Error: "Error parsing FIREBASE_CREDENTIALS_JSON"
- Make sure the JSON is valid and on a single line
- Ensure all quotes are properly escaped
- Use Method 1 (Python) to ensure correct formatting

### Error: "Firebase Admin SDK not initialized"
- Check that `FIREBASE_CREDENTIALS_JSON` is set in Railway
- Verify the JSON content is correct (use the Python method)
- Check Railway logs for detailed error messages

### Still Not Working?
1. Check Railway logs for the exact error message
2. Verify the environment variable is set: Go to Variables tab and confirm `FIREBASE_CREDENTIALS_JSON` exists
3. Make sure you redeployed after adding the variable

## Security Note

⚠️ **Never commit `ServiceAccountKey.json` to Git!**

- The file should be in `.gitignore`
- Only use environment variables in production
- Keep your service account key secure

