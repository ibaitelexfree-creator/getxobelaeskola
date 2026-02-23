# Task: Preview Deployment Accessibility

## Objective
Enable instant access to Render Preview deployments via Telegram and Mission Control (Control Manager), with a selector for environment preference (Render vs Local).

## Status
- [ ] Implement `jules_delegate_trio` in `orchestration/index.js`
- [ ] Update Jules roles in `mission-control/src/lib/maestro-client.ts`
- [ ] Update `julesConfig` in `mission-control/src/components/TaskLauncher.tsx`
- [ ] Modify `orchestration/lib/render-autofix.js` to handle successful deploys
- [ ] Update `orchestration/index.js` to broadcast Preview URLs to Telegram/Memory
- [ ] Create `EnvironmentSelector` component in Mission Control
- [ ] Test end-to-end flow

## Technical Details
- **Render Webhook**: Extend `handleRenderWebhook` to detect `deploy_succeeded` on feature branches.
- **Environment Selector**: Persistent UI element to toggle `PREVIEW_MODE` (render/local).
- **Communication**: Jules Trio flow must capture the Preview URL and pass it to Analytics.

## Workflow (TRIO)
1. **Dev**: Push code -> PR -> Render Preview Created.
2. **Webhook**: Notifies Orchestrator -> Sends Telegram Message + Updates Dashboard.
3. **Selector**: User chooses how to open the link.
