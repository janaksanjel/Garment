import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import {
  Warehouse,
  Package,
  Layers,
  RotateCcw,
  Wrench,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { WarehouseZone } from '@/types';

type ZoneType = WarehouseZone['type'];

const ZONE_CONFIG: Record<ZoneType, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  raw:      { label: 'Raw Materials', icon: Package,    color: 'text-info',        bg: 'bg-info/10',        border: 'border-info' },
  wip:      { label: 'Work In Progress', icon: Wrench,  color: 'text-warning',     bg: 'bg-warning/10',     border: 'border-warning' },
  finished: { label: 'Finished Goods', icon: Layers,    color: 'text-success',     bg: 'bg-success/10',     border: 'border-success' },
  returns:  { label: 'Returns',        icon: RotateCcw, color: 'text-destructive',  bg: 'bg-destructive/10', border: 'border-destructive' },
};

const WarehouseManagement: React.FC = () => {
  const { activeBrandId } = useAuthStore();
  const { getWarehouseZonesByBrand, getStockByBrand } = useInventoryStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ZoneType | 'all'>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const zones = activeBrandId ? getWarehouseZonesByBrand(activeBrandId) : [];
  const stock = activeBrandId ? getStockByBrand(activeBrandId) : [];

  const filtered = zones.filter((z) => {
    const matchSearch = z.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || z.type === typeFilter;
    return matchSearch && matchType;
  });

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalCapacity = zones.reduce((s, z) => s + z.capacity, 0);
  const totalStock    = zones.reduce((s, z) => s + z.currentStock, 0);
  const overCapacity  = zones.filter((z) => z.currentStock > z.capacity).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Warehouse Management</h1>
          <p className="text-muted-foreground mt-1">Zone configuration, capacity tracking & inventory reconciliation</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
            <Warehouse className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold">{zones.length}</p>
          <p className="text-xs text-muted-foreground">Total Zones</p>
        </div>
        <div className="card-elevated p-4">
          <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center mb-2">
            <Package className="w-4 h-4 text-info" />
          </div>
          <p className="text-2xl font-bold">{totalStock.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Units Stored</p>
        </div>
        <div className="card-elevated p-4">
          <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold">{totalCapacity.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Capacity</p>
        </div>
        <div className="card-elevated p-4">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-2', overCapacity > 0 ? 'bg-destructive/10' : 'bg-success/10')}>
            <AlertTriangle className={cn('w-4 h-4', overCapacity > 0 ? 'text-destructive' : 'text-success')} />
          </div>
          <p className="text-2xl font-bold">{overCapacity}</p>
          <p className="text-xs text-muted-foreground">Over Capacity</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search zones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setTypeFilter('all')}
            className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', typeFilter === 'all' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}
          >
            All
          </button>
          {(Object.keys(ZONE_CONFIG) as ZoneType[]).map((t) => {
            const cfg = ZONE_CONFIG[t];
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(typeFilter === t ? 'all' : t)}
                className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', typeFilter === t ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((zone) => {
          const cfg = ZONE_CONFIG[zone.type];
          const Icon = cfg.icon;
          const utilPct = Math.min(Math.round((zone.currentStock / zone.capacity) * 100), 100);
          const isOver = zone.currentStock > zone.capacity;
          const isOpen = expanded[zone.id];
          const zoneStock = stock.filter((s) => s.location.toLowerCase().includes(zone.name.split('–')[0].trim().toLowerCase()));

          return (
            <motion.div
              key={zone.id}
              layout
              className={cn('card-elevated overflow-hidden border-l-4', cfg.border)}
            >
              {/* Zone Header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', cfg.bg)}>
                      <Icon className={cn('w-5 h-5', cfg.color)} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{zone.name}</h3>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  {isOver && (
                    <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                      <AlertTriangle className="w-3 h-3" /> Over Capacity
                    </span>
                  )}
                </div>

                {/* Capacity Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Capacity Used</span>
                    <span className={cn('font-semibold', isOver ? 'text-destructive' : utilPct > 80 ? 'text-warning' : 'text-success')}>
                      {utilPct}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', isOver ? 'bg-destructive' : utilPct > 80 ? 'bg-warning' : 'bg-success')}
                      style={{ width: `${utilPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{zone.currentStock.toLocaleString()} units stored</span>
                    <span>{zone.capacity.toLocaleString()} capacity</span>
                  </div>
                </div>

                {/* Shelf Summary */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{zone.shelves.length} shelves</span>
                  <button
                    onClick={() => toggleExpand(zone.id)}
                    className="flex items-center gap-1 text-sm text-accent hover:underline"
                  >
                    {isOpen ? <><ChevronUp className="w-4 h-4" /> Hide Shelves</> : <><ChevronDown className="w-4 h-4" /> View Shelves</>}
                  </button>
                </div>
              </div>

              {/* Shelf Breakdown */}
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border"
                >
                  <div className="p-4 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shelf Breakdown</p>
                    {zone.shelves.map((shelf) => {
                      const shelfPct = Math.min(Math.round((shelf.currentStock / shelf.capacity) * 100), 100);
                      return (
                        <div key={shelf.id} className="flex items-center gap-4">
                          <span className="text-sm w-24 shrink-0 font-medium">{shelf.name}</span>
                          <div className="flex-1">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn('h-full rounded-full', shelfPct > 90 ? 'bg-destructive' : shelfPct > 70 ? 'bg-warning' : 'bg-accent')}
                                style={{ width: `${shelfPct}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground w-24 text-right shrink-0">
                            {shelf.currentStock} / {shelf.capacity}
                          </span>
                        </div>
                      );
                    })}

                    {zoneStock.length > 0 && (
                      <>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Stock Items</p>
                        {zoneStock.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                            </div>
                            <span className="font-semibold">{item.quantity.toLocaleString()} {item.unit}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default WarehouseManagement;
