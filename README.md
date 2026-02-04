# Combinator Deploy Action

GitHub Action for deploying workers to the Combinator platform.

## Inputs

| Name | Description | Required |
|------|-------------|----------|
| `private-key` | RSA private key for signing requests | Yes |
| `user-id` | Your Combinator user ID | Yes |
| `worker-id` | Unique identifier for the worker | Yes |
| `image` | Docker image to deploy | Yes |
| `port` | Container port to expose | Yes |

## Outputs

| Name | Description |
|------|-------------|
| `response` | API response from the deployment |

## Usage

```yaml
- name: Deploy to Combinator
  uses: Jabberwocky238/combinator-action@main
  with:
    private-key: ${{ secrets.COMBINATOR_PRIVATE_KEY }}
    user-id: ${{ secrets.COMBINATOR_USER_ID }}
    worker-id: my-worker
    image: ghcr.io/username/my-app:latest
    port: 8080
```

## Setup

1. Register at [console.app238.com](https://console.app238.com)
2. Save your private key from registration
3. Add secrets to your repository:
   - `COMBINATOR_PRIVATE_KEY`: Your RSA private key
   - `COMBINATOR_USER_ID`: Your user ID

## Example Workflow

```yaml
name: Build and Push

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-docker:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha
            type=raw,value=latest

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to Combinator
        uses: Jabberwocky238/combinator-action@main
        with:
          private-key: ${{ secrets.COMBINATOR_PRIVATE_KEY }}
          user-id: ${{ secrets.COMBINATOR_USER_ID }}
          worker-id: my-app
          image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:sha-${{ github.sha }}
          port: 8080
```
