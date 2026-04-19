import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Terminal, Download, FileCode, Wifi, Search, Usb } from "lucide-react";
import { USB_VENDORS } from "@/lib/satcom";

const SCRIPTS = [
  {
    name: "poll_modem.sh",
    description: "SSH/Telnet modem telemetry — polls iDirect/HughesNet modems for SNR and Tx Power at configurable intervals",
    language: "Bash",
    protocol: "SSH / Telnet",
    icon: Wifi,
    features: ["SNR/Eb-No monitoring", "Tx Power tracking", "SSH key or password auth", "sshpass / expect support"],
    config: ["MODEM_IP", "MODEM_USER", "MODEM_PASS", "POLLING_INTERVAL", "PROTOCOL"],
  },
  {
    name: "snr_monitor.py",
    description: "Raw TCP socket SNR polling for modems exposing a direct TCP command interface",
    language: "Python",
    protocol: "Raw TCP",
    icon: Terminal,
    features: ["Socket-based polling", "Threshold alerting (< 5dB critical, < 8dB warning)", "Configurable timeout", "Auto-reconnect"],
    config: ["MODEM_IP", "MODEM_PORT", "SNR_COMMAND", "MONITOR_INTERVAL"],
  },
  {
    name: "detect_vsat_rogue_nodes.sh",
    description: "3-stage Nmap subnet recon — host discovery, detailed port/service/OS scan, anomaly flagging",
    language: "Bash",
    protocol: "ICMP / TCP",
    icon: Search,
    features: ["Ping sweep (Stage 1)", "SYN stealth scan with -sV -O (Stage 2)", "Web interface detection (Stage 3)", "Timestamped report directory"],
    config: ["VSAT_SUBNET"],
  },
];

// Resolve the USB devices from the audit files
const DETECTED_USB = [
  { vid: "1bcf", pid: "2b96", serial: "N/A" },
  { vid: "0cf3", pid: "e007", serial: "N/A" },
  { vid: "413c", pid: "81b6", serial: "LF84958940031027" },
];

export default function FieldToolkit() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1200px]">
      <div>
        <h2 className="text-base font-semibold">Field Toolkit</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Operational scripts and hardware audit tools for VSAT field work
        </p>
      </div>

      {/* Scripts */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Monitoring Scripts</h3>
        {SCRIPTS.map((s) => (
          <Card key={s.name} className="border-border/50" data-testid={`script-${s.name}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                  <s.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold font-mono">{s.name}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">{s.language}</Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-muted/30">{s.protocol}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{s.description}</p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground/70 mb-1">Features</p>
                      {s.features.map((f) => (
                        <p key={f} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-primary shrink-0" />{f}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground/70 mb-1">Configuration</p>
                      {s.config.map((c) => (
                        <p key={c} className="text-[11px] font-mono text-muted-foreground">{c}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* USB Audit */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2">
          <Usb className="w-3.5 h-3.5" />
          USB Device Audit
        </h3>
        <Card className="border-border/50">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">Detected Devices (resolved from USB ID database)</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {DETECTED_USB.map((d, i) => {
                const vendor = USB_VENDORS[d.vid] || "Unknown Vendor";
                return (
                  <div key={i} className="flex items-center gap-3 p-2 -mx-2 rounded-md bg-muted/20">
                    <div className="p-1.5 rounded bg-muted/50">
                      <Usb className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{vendor}</span>
                        {vendor !== "Unknown Vendor" && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-green-500/10 text-green-400 border-green-500/20">identified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground mt-0.5">
                        <span>VID:{d.vid}</span>
                        <span>PID:{d.pid}</span>
                        {d.serial !== "N/A" && <span>SN:{d.serial}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              VID:413c resolves to Dell Inc. — likely an integrated Dell peripheral (webcam, hub, or docking station given the serial prefix LF849).
              VID:1bcf (Sunplus Innovation) is typically a webcam controller.
              VID:0cf3 (Qualcomm Atheros) is a wireless/Bluetooth adapter.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
