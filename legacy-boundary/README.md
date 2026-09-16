# Legacy and direct-API boundary

The current direct Letta REST API and its generated clients are not categorically “V1” or retired. They are an optional low-level surface when a Master Builder needs a documented operation that is not appropriately expressed through the Agent SDK.

This directory quarantines only exact deprecated, removed, or retired patterns recorded in `denylist.yml`. Recognition does not authorize implementation. Before publishing a legacy classification, the curriculum must register evidence for the exact package, endpoint, command, field, or runtime pattern rather than infer status from an adjacent client name.

The mandatory greenfield curriculum path remains Agent SDK. The direct REST/API path is optional and must use current official reference material. Retired Python-server architecture and removed tools/configuration have no greenfield fallback branch.
