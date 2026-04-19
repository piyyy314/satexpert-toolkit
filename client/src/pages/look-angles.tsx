import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Compass, Crosshair, RotateCw, Ruler, MapPin, Satellite } from "lucide-react";
import { calculateLookAngles, SATELLITES, type Coordinates, type LookAngles } from "@/lib/satcom";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-green-500/15 text-green-400 border-green-500/20",
  maintenance: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  offline: "bg-red-500/15 text-red-400 border-red-500/20",
  decommissioned: "bg-muted text-muted-foreground border-border",
};

function AngleCard({ label, value, unit, icon: Icon }: { label: string; value: number; unit: string; icon: any }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
            <p className="text-xl font-semibold tabular-nums font-mono">
              {value.toFixed(2)}<span className="text-sm text-muted-foreground ml-0.5">{unit}</span>
            </p>
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LookAnglesPage() {
  const [satId, setSatId] = useState("t-11w");
  const [lat, setLat] = useState("41.1955");  // Nanticoke, PA
  const [lng, setLng] = useState("-76.0049");

  const satellite = SATELLITES.find((s) => s.id === satId)!;
  const userLoc: Coordinates = { lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0 };
  const angles: LookAngles = useMemo(() => calculateLookAngles(userLoc, satellite.longitude), [userLoc.lat, userLoc.lng, satellite.longitude]);

  const elevationOk = angles.elevation > 5;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1200px]">
      <div>
        <h2 className="text-base font-semibold">Look-Angle Calculator</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Antenna alignment parameters for GEO satellite pointing
        </p>
      </div>

      {/* Inputs */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Target Satellite</label>
              <Select value={satId} onValueChange={setSatId}>
                <SelectTrigger className="h-9 text-xs" data-testid="select-satellite">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SATELLITES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.orbitalSlot})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Latitude</label>
              <Input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="h-9 text-xs font-mono"
                data-testid="input-lat"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Longitude</label>
              <Input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="h-9 text-xs font-mono"
                data-testid="input-lng"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>Ground station: {parseFloat(lat).toFixed(4)}°, {parseFloat(lng).toFixed(4)}°</span>
            <span className="text-muted-foreground/50">→</span>
            <Satellite className="w-3 h-3" />
            <span>{satellite.name} @ {satellite.orbitalSlot}</span>
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ml-1 ${STATUS_STYLE[satellite.status]}`}>
              {satellite.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AngleCard label="Azimuth" value={angles.azimuth} unit="°" icon={Compass} />
        <AngleCard label="Elevation" value={angles.elevation} unit="°" icon={Crosshair} />
        <AngleCard label="Polarization Skew" value={angles.skew} unit="°" icon={RotateCw} />
        <AngleCard label="Slant Range" value={angles.distance} unit=" km" icon={Ruler} />
      </div>

      {/* Elevation warning */}
      {!elevationOk && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-3 text-xs text-red-400">
            Elevation angle is below 5° — signal will suffer heavy atmospheric attenuation and multipath interference. Consider a different satellite for this ground station location.
          </CardContent>
        </Card>
      )}

      {/* Satellite details */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium">Orbital Parameters</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6 text-xs">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Operator</p>
              <p className="font-medium">{satellite.operator}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Apogee</p>
              <p className="font-mono">{satellite.apogee.toLocaleString()} km</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Perigee</p>
              <p className="font-mono">{satellite.perigee.toLocaleString()} km</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Inclination</p>
              <p className="font-mono">{satellite.inclination.toFixed(2)}°</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Velocity</p>
              <p className="font-mono">{satellite.velocity.toFixed(2)} km/s</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Orbital Slot</p>
              <p className="font-mono">{satellite.orbitalSlot}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Longitude</p>
              <p className="font-mono">{satellite.longitude}°</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Status</p>
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${STATUS_STYLE[satellite.status]}`}>
                {satellite.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
