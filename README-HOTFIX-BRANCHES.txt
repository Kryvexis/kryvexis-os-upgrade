Kryvexis OS branch alignment hotfix

Included fixes:
- auth page signup branch values now match production DB ids: JHB, CPT, DBN
- removed the small top-left 'Kryvexis OS' eyebrow on the auth page
- auth service now normalizes both legacy BR-* ids and live short ids
- auth service safely falls back when app_users.is_active is not present yet
- seed script branch ids aligned to JHB/CPT/DBN

After pushing, redeploy the backend and frontend.
