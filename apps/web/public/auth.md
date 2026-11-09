# auth.md - Agent Registration and Authentication Specification

This document defines autonomous agent registration, token acquisition, and capability discovery for the Onur Dursun Portfolio API and autonomous services.

## 1. Audience
- Autonomous AI Agents, Agent-to-Agent (A2A) conduits, and Model Context Protocol (MCP) clients.

## 2. OAuth Discovery Endpoints
- **Protected Resource Metadata (PRM):** `https://onurd.com.tr/.well-known/oauth-protected-resource`
- **OAuth Authorization Server:** `https://onurd.com.tr/.well-known/oauth-authorization-server`
- **Agent Skills Directory:** `https://onurd.com.tr/.well-known/agent-skills/index.json`
- **API Catalog:** `https://onurd.com.tr/.well-known/api-catalog`

## 3. Supported Authentication Methods

### Method A: Anonymous Agent Assertion (Read-Only)
- **Supported Identity:** `anonymous`
- **Credential Types:** `bearer`
- **Claim Endpoint:** `https://onurd.com.tr/api/agent/claim`
- **Use Case:** Public semantic inspection, technical architectures retrieval, and `llms.txt` ingestion.

### Method B: Verified Identity / ID-JAG Assertion
- **Supported Identity:** `identity_assertion`
- **Assertion Types:** `urn:ietf:params:oauth:token-type:id-jag`, `verified_email`
- **Credential Types:** `bearer`
- **Claim Endpoint:** `https://onurd.com.tr/api/agent/claim`
- **Revocation Endpoint:** `https://onurd.com.tr/api/agent/revoke`
- **Use Case:** Authenticated project inquiries, bidirectional A2A communication, and developer contact relay.

## 4. Agent Registration Flow
Autonomous agents register via `POST https://onurd.com.tr/api/agent/auth` by supplying their conformant `urn:air` agent identifier and requested scopes (`portfolio:read`, `contact:write`).
