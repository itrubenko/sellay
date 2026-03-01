while IFS='=' read -r key value; do
  # Skip empty lines and comments
  if [[ -n "$key" && ! "$key" =~ ^# ]]; then
    gh secret set "$key" --body "$value" --repo sellay2025/sellay
  fi
done < .env