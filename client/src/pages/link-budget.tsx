import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Signal, Gauge, Radio, Thermometer } from "lucide-react";
import {
  calculateLookAngles, calculateLinkBudget, SATELLITES,
  type LinkBudgetParams, type LinkBudgetResults,
} from "@/lib/satcom";

function ResultRow({ label, value, unit, highlight }: { label: string; value: string | number; unit: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-mono tabular-nums ${highlight ? "text-primary font-semibold" : ""}`}>
        {typeof value === "number" ? value.toFixed(2) : value} <span className="text-[10px] text-muted-foreground">{unit}</span>
      </span>
    </div>
  );
}

export default function LinkBudgetPage() {
  const [satId, setSatId] = useState("t-11w");
  const [params, setParams] = useState<LinkBudgetParams>({
    uplinkFreq: 14.25,
    downlinkFreq: 11.95,
    txPower: 2,
    antSize: 1.2,
    efficiency: 60,
    lnbNoiseTemp: 75,
    rainFade: 1.5,
    dataRate: 10,
  });

  const satellite = SATELLITES.find((s) => s.id === satId)!;
  // Use Nanticoke PA as default ground station
  const angles = useMemo(() => calculateLookAngles({ lat: 41.1955, lng: -76.0049 }, satellite.longitude), [satellite.longitude]);
  const results: LinkBudgetResults = useMemo(() => calculateLinkBudget(params, angles.distance), [params, angles.distance]);

  const updateParam = (key: keyof LinkBudgetParams, val: number) => {
    setParams((p) => ({ ...p, [key]: val }));
  };

  const marginColor = results.margin === "Excellent" ? "text-green-400" : results.margin === "Good" ? "text-blue-400" : results.margin === "Marginal" ? "text-yellow-400" : "text-red-400";
  const marginBg = results.margin === "Excellent" ? "bg-green-500/15 border-green-500/20" : results.margin === "Good" ? "bg-blue-500/15 border-blue-500/20" : results.margin === "Marginal" ? "bg-yellow-500/15 border-yellow-500/20" : "bg-red-500/15 border-red-500/20";

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1200px]">
      <div>
        <h2 className="text-base font-semibold">Link Budget Calculator</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          RF performance analysis — FSPL, antenna gain, G/T, Eb/No, and BER estimation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Parameters */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary" />
              Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <div>
              <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Target Satellite</label>
              <Select value={satId} onValueChange={setSatId}>
                <SelectTrigger className="h-9 text-xs" data-testid="select-sat-budget">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SATELLITES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.orbitalSlot})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Uplink Freq (GHz)</label>
                <Input type="number" step="0.01" value={params.uplinkFreq} onChange={(e) => updateParam("uplinkFreq", parseFloat(e.target.value) || 0)} className="h-9 text-xs font-mono" data-testid="input-uplink-freq" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Downlink Freq (GHz)</label>
                <Input type="number" step="0.01" value={params.downlinkFreq} onChange={(e) => updateParam("downlinkFreq", parseFloat(e.target.value) || 0)} className="h-9 text-xs font-mono" data-testid="input-downlink-freq" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Tx Power (dBW)</label>
                <Input type="number" step="0.5" value={params.txPower} onChange={(e) => updateParam("txPower", parseFloat(e.target.value) || 0)} className="h-9 text-xs font-mono" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Antenna Diameter (m)</label>
                <Input type="number" step="0.1" value={params.antSize} onChange={(e) => updateParam("antSize", parseFloat(e.target.value) || 0)} className="h-9 text-xs font-mono" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase text-muted-foreground">Antenna Efficiency</label>
                <span className="text-xs font-mono text-primary">{params.efficiency}%</span>
              </div>
              <Slider value={[params.efficiency]} onValueChange={([v]) => updateParam("efficiency", v)} min={30} max={85} step={1} className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-muted-foreground mb-1 block">LNB Noise Temp (K)</label>
                <Input type="number" step="5" value={params.lnbNoiseTemp} onChange={(e) => updateParam("lnbNoiseTemp", parseFloat(e.target.value) || 0)} className="h-9 text-xs font-mono" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Data Rate (Mbps)</label>
                <Input type="number" step="1" value={params.dataRate} onChange={(e) => updateParam("dataRate", parseFloat(e.target.value) || 0)} className="h-9 text-xs font-mono" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase text-muted-foreground">Rain Fade Attenuation</label>
                <span className="text-xs font-mono text-primary">{params.rainFade.toFixed(1)} dB</span>
              </div>
              <Slider value={[params.rainFade]} onValueChange={([v]) => updateParam("rainFade", v)} min={0} max={15} step={0.5} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {/* Margin badge */}
          <Card className={`border ${marginBg}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Link Margin</p>
                <p className={`text-lg font-semibold font-mono ${marginColor}`}>{results.margin}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Eb/No</p>
                <p className={`text-lg font-semibold font-mono tabular-nums ${marginColor}`}>{results.ebNo.toFixed(1)} dB</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                Calculated Values
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ResultRow label="Free Space Path Loss" value={results.fspl} unit="dB" />
              <ResultRow label="Antenna Gain" value={results.antGain} unit="dBi" />
              <ResultRow label="EIRP" value={results.eirp} unit="dBW" highlight />
              <ResultRow label="G/T (Figure of Merit)" value={results.gt} unit="dB/K" />
              <ResultRow label="Eb/No" value={results.ebNo} unit="dB" highlight />
              <ResultRow label="Est. BER (QPSK)" value={results.ber} unit="" />
              <ResultRow label="Slant Range" value={angles.distance} unit="km" />
              <ResultRow label="Rain Fade" value={params.rainFade} unit="dB" />
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3 text-[11px] text-muted-foreground space-y-1">
              <p>Calculations use standard GEO link budget equations. FSPL = 20log(d) + 20log(f) + 92.45.</p>
              <p>BER estimates assume QPSK modulation. Actual performance depends on modem implementation, coding gain, and adjacent channel interference.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
