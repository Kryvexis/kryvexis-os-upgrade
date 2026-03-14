Kryvexis OS Phase 1 patch

Included in this package:
- Real backend auth endpoints: /api/auth/login, /api/auth/me, /api/auth/logout, /api/auth/switch-branch
- Global API auth gate for /api/* except bootstrap and auth endpoints
- Permission protection on sensitive write routes
- Frontend login/me/switchBranch/logout now use backend auth instead of local demo role inference
- AuthSession extended with branchId and permissions

Smoke-tested:
- backend boot
- login success for kryvexissolutions@gmail.com
- 401 on protected route without token
- 403 on quote approval with sales user
- branch switch from Johannesburg to Cape Town
- frontend production build
