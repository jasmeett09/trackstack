import { useEffect } from 'react';
import { subscribeToOrganizationSocket } from '../lib/socket';

function useOrganizationRealtimeRefresh(user, refresh) {
  useEffect(() => {
    let detachSocketListener = () => {};

    const connect = async () => {
      try {
        detachSocketListener = await subscribeToOrganizationSocket({
          organizationId: user.organizationId,
          userId: user.id,
          handlers: {
            'stock:update': () => {
              refresh();
            },
            'inventory:item.changed': () => {
              refresh();
            }
          }
        });
      } catch (error) {
        console.error('Realtime refresh unavailable:', error);
      }
    };

    if (user?.organizationId && user?.id) {
      connect();
    }

    return () => {
      detachSocketListener();
    };
  }, [refresh, user?.id, user?.organizationId]);
}

export default useOrganizationRealtimeRefresh;
