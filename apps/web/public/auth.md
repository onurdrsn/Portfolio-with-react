# auth.md - Agent Registration & Authentication

This document specifies authentication, authorization, and discovery metadata for autonomous AI agents interacting with the Onur Dursun Portfolio API.

## 1. Audience
Autonomous agents, MCP clients, A2A agents, and automated retrieval services.

## 2. Discovery Endpoints
- **Protected Resource Metadata (PRM):** `https://onurd.com.tr/.well-known/oauth-protected-resource`
- **Authorization Server Metadata:** `https://onurd.com.tr/.well-known/oauth-authorization-server`
- **Agent Skills:** `https://onurd.com.tr/.well-known/agent-skills/index.json`
- **API Catalog:** `https://onurd.com.tr/.well-known/api-catalog`

## 3. Supported Methods
1. **Anonymous / Read-Only Access:**
   - Public architectural case studies, project records, and LLM context (`/llms.txt`) do not require credentials.
2. **Bearer Token Authentication:**
   - Standard HTTP Authorization Header: `Authorization: Bearer <token>`
   - Scopes: `portfolio:read`, `contact:write`

## 4. Registration & Provisioning
- Endpoint: `https://onurd.com.tr/api/agent/auth`
- Method: `POST`
- Payload: `{"agent_id": "urn:air:...", "identity_type": "anonymous"}`
