'use client';

import { useState, useEffect, useRef } from 'react';
import { subscribeSyncStatus, syncPendingActions, preloadOfflineBundle, type SyncStatus } from '@/lib/offline-db';
import { adminApi } from '@/lib/api';

function formatTime(timestamp: number | null): string {
  if (!timestamp) return 'No disponible';
  const diffSec = Math.round((Date.now() - timestamp) / 1000);
  if (diffSec < 15) return 'Hace unos segundos';
  if (diffSec < 60) return `Hace ${diffSec} seg`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `Hace ${diffMin} min`;
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function OfflineSyncBadge() {
  const [status, setStatus] = useState<SyncStatus>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    isSyncing: false,
    isPreloading: false,
    cachedCount: 0,
    lastSyncedAt: null,
    lastSavedAt: null,
  });
  const [open, setOpen] = useState(false);
  const [manualBusy, setManualBusy] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeSyncStatus((s) => {
      setStatus(s);
    });
    return () => unsubscribe();
  }, []);

  // Cerrar el popover al hacer clic afuera
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSyncNow = async () => {
    if (!status.online || status.isSyncing) return;
    setManualBusy(true);
    try {
      await syncPendingActions();
    } finally {
      setManualBusy(false);
    }
  };

  const handlePreloadNow = async () => {
    if (!status.online || status.isPreloading) return;
    setManualBusy(true);
    try {
      const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('lacajita.admin') || '' : '';
      const client = adminApi(token);
      await preloadOfflineBundle([
        () => client.summary(true),
        () => client.orders({}, true),
        () => client.inventory(true),
        () => client.products(true),
        () => client.customers('', true),
        () => client.coupons(true),
        () => client.zones(true),
        () => client.settings(true),
      ]);
    } finally {
      setManualBusy(false);
    }
  };

  const isSaving = status.isPreloading || manualBusy;

  // Texto resumido para la barra
  let badgeClass = 'bo-sync-online';
  let badgeLabel = 'En línea';

  if (!status.online) {
    badgeClass = 'bo-sync-offline';
    badgeLabel = 'Sin conexión';
  } else if (status.pendingCount > 0) {
    badgeClass = 'bo-sync-pending';
    badgeLabel = `${status.pendingCount} pendientes`;
  } else if (isSaving) {
    badgeClass = 'bo-sync-saving';
    badgeLabel = 'Guardando datos...';
  } else if (status.cachedCount > 0) {
    badgeClass = 'bo-sync-ready';
    badgeLabel = 'En línea · Listo offline';
  }

  return (
    <div className="bo-sync-widget-wrap" ref={containerRef}>
      <button
        type="button"
        className={`bo-sync-badge ${badgeClass}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Ver estado de conexión y datos offline"
        title="Clic para ver detalles de conexión y respaldo local"
      >
        <span className={`bo-sync-dot ${!status.online ? 'offline' : status.pendingCount > 0 ? 'pending' : 'online'}`} />
        <span className="bo-hide-sm">{badgeLabel}</span>
        {status.pendingCount > 0 && <span className="bo-sync-count">{status.pendingCount}</span>}
      </button>

      {open && (
        <div className="bo-sync-popover" role="dialog" aria-label="Panel de estado offline">
          <div className="bo-sync-popover-header">
            <h4 className="bo-sync-popover-title">Estado de Datos y Conexión</h4>
            <span className={`bo-sync-pill ${status.online ? 'is-online' : 'is-offline'}`}>
              {status.online ? 'Internet Activo' : 'Modo Sin Conexión'}
            </span>
          </div>

          <div className="bo-sync-popover-body">
            <div className="bo-sync-row">
              <span className="bo-sync-label">Disponibilidad offline:</span>
              <span className="bo-sync-val">
                {status.cachedCount > 0 ? (
                  <b className="text-green">✓ Lista para operar sin red ({status.cachedCount} módulos)</b>
                ) : (
                  <b className="text-amber">⏳ Descargando copia inicial...</b>
                )}
              </span>
            </div>

            <div className="bo-sync-row">
              <span className="bo-sync-label">Último respaldo local:</span>
              <span className="bo-sync-val">{formatTime(status.lastSavedAt)}</span>
            </div>

            <div className="bo-sync-row">
              <span className="bo-sync-label">Cambios pendientes:</span>
              <span className="bo-sync-val">
                {status.pendingCount === 0 ? 'Todo sincronizado' : `${status.pendingCount} en cola`}
              </span>
            </div>
          </div>

          <div className="bo-sync-popover-footer">
            {status.online && (
              <button
                type="button"
                className="bo-btn bo-btn--secondary bo-btn--sm"
                onClick={handlePreloadNow}
                disabled={isSaving}
              >
                {isSaving ? 'Guardando copia...' : '📥 Descargar copia fresca ahora'}
              </button>
            )}

            {status.pendingCount > 0 && status.online && (
              <button
                type="button"
                className="bo-btn bo-btn--primary bo-btn--sm"
                onClick={handleSyncNow}
                disabled={status.isSyncing || manualBusy}
              >
                {status.isSyncing ? 'Sincronizando...' : '🚀 Sincronizar pendientes'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
