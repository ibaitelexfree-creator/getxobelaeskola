const fs = require('fs');

const content = fs.readFileSync('src/hooks/usePushNotifications.test.ts', 'utf8');

const updated = content.replace(
  "await waitFor(() => expect(PushNotifications.checkPermissions).toHaveBeenCalled());",
  "await waitFor(() => expect(result.current.permission).toBe('granted'));\n        expect(PushNotifications.checkPermissions).toHaveBeenCalled();"
);

fs.writeFileSync('src/hooks/usePushNotifications.test.ts', updated);
