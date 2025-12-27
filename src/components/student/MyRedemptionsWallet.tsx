/**
 * MY REDEMPTIONS WALLET PAGE
 * Shows saved redemptions with status and actions
 * Entry point: "Redeem Rewards" button / "My Redemptions" tab
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Empty,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RedemptionData } from "@/lib/qr-utils";

interface MyRedemptionsWalletProps {
  redemptions: RedemptionData[];
  onViewQR?: (redemption: RedemptionData) => void;
  onDownloadQR?: (redemption: RedemptionData) => void;
  QRCodeComponent?: React.ComponentType<any>;
}

interface QRPreviewState {
  open: boolean;
  redemption: RedemptionData | null;
}

export function MyRedemptionsWallet({
  redemptions,
  onViewQR,
  onDownloadQR,
  QRCodeComponent,
}: MyRedemptionsWalletProps) {
  const { t } = useTranslation();
  const [qrPreview, setQRPreview] = useState<QRPreviewState>({
    open: false,
    redemption: null,
  });

  const handleViewQR = (redemption: RedemptionData) => {
    setQRPreview({ open: true, redemption });
    onViewQR?.(redemption);
  };

  const handleDownloadQR = (redemption: RedemptionData) => {
    onDownloadQR?.(redemption);
  };

  const getStatusConfig = (
    status: RedemptionData["status"]
  ): {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    label: string;
  } => {
    const configs = {
      pending: {
        icon: <Clock className="h-4 w-4" />,
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10 border-yellow-400/30",
        label: t("redemption.status.pending", {
          defaultValue: "🟡 Pending Verification",
        }),
      },
      verified: {
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10 border-blue-400/30",
        label: t("redemption.status.verified", {
          defaultValue: "🔵 Verified",
        }),
      },
      collected: {
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "text-green-400",
        bgColor: "bg-green-400/10 border-green-400/30",
        label: t("redemption.status.collected", {
          defaultValue: "🟢 Collected",
        }),
      },
      expired: {
        icon: <AlertCircle className="h-4 w-4" />,
        color: "text-red-400",
        bgColor: "bg-red-400/10 border-red-400/30",
        label: t("redemption.status.expired", {
          defaultValue: "🔴 Expired",
        }),
      },
      rejected: {
        icon: <XCircle className="h-4 w-4" />,
        color: "text-red-600",
        bgColor: "bg-red-600/10 border-red-600/30",
        label: t("redemption.status.rejected", {
          defaultValue: "❌ Rejected",
        }),
      },
    };

    return configs[status] || configs.pending;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (redemptions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <div className="rounded-full bg-primary/10 p-4">
          <AlertCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-heading font-semibold">
          {t("redemption.noRedemptions", {
            defaultValue: "No Saved Redemptions",
          })}
        </h3>
        <p className="text-center text-sm text-muted-foreground">
          {t("redemption.redeemProductsToStart", {
            defaultValue: "Redeem products to see them here!",
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-heading font-bold">
          {t("redemption.myRedemptions", {
            defaultValue: "My Redemptions",
          })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("redemption.walletDescription", {
            defaultValue: "View and manage your saved redemption QR codes",
          })}
        </p>
      </div>

      {/* Redemptions Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {redemptions.map((redemption) => {
          const statusConfig = getStatusConfig(redemption.status);
          const isExpired = redemption.expiryDate < Date.now();
          const displayStatus = isExpired ? "expired" : redemption.status;

          return (
            <Card
              key={redemption.id}
              className="flex flex-col overflow-hidden border border-primary/20 bg-card/40 backdrop-blur-sm transition-all hover:bg-card/60 hover:border-primary/40"
            >
              {/* Status Badge */}
              <div className="flex items-start justify-between border-b border-border/30 p-3">
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-foreground line-clamp-2">
                    {redemption.productName}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(redemption.timestamp)}
                  </p>
                </div>
                <div
                  className={`${statusConfig.bgColor} border ml-2 rounded-lg px-2 py-1 ${statusConfig.color}`}
                >
                  {statusConfig.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-3 p-3">
                {/* Redemption Code */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("redemption.code", { defaultValue: "Code" })}
                  </p>
                  <code className="mt-1 block font-mono text-sm font-bold text-primary">
                    {redemption.redemptionCode}
                  </code>
                </div>

                {/* Status Info */}
                <div className="rounded-lg bg-card/40 p-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("redemption.status", { defaultValue: "Status" })}
                  </p>
                  <p className="mt-1 text-xs text-foreground">
                    {getStatusConfig(displayStatus).label}
                  </p>
                </div>

                {/* Expiry Info */}
                {isExpired ? (
                  <div className="flex items-center gap-2 rounded-lg bg-red-400/10 border border-red-400/30 p-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                    <p className="text-xs text-red-400">
                      {t("redemption.expired", {
                        defaultValue: "QR code expired",
                      })}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {t("redemption.expiresIn", {
                        defaultValue: "Expires in 7 days",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-border/30 p-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewQR(redemption)}
                  disabled={isExpired}
                  className="flex-1"
                >
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {t("redemption.viewQR", { defaultValue: "View QR" })}
                  </span>
                  <span className="inline sm:hidden">View</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadQR(redemption)}
                  disabled={isExpired}
                  className="flex-1"
                >
                  <Download className="mr-1 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {t("redemption.download", { defaultValue: "Download" })}
                  </span>
                  <span className="inline sm:hidden">DL</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* QR Preview Dialog */}
      {qrPreview.redemption && (
        <Dialog
          open={qrPreview.open}
          onOpenChange={(open) =>
            setQRPreview({ ...qrPreview, open })
          }
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {t("redemption.viewQR", {
                  defaultValue: "QR Code",
                })}
              </DialogTitle>
              <DialogDescription>
                {qrPreview.redemption.productName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center rounded-lg bg-white p-4">
                {QRCodeComponent ? (
                  <QRCodeComponent
                    value={qrPreview.redemption.redemptionCode}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center rounded bg-muted">
                    <p className="text-sm text-muted-foreground">QR Code</p>
                  </div>
                )}
              </div>

              {/* Redemption Code */}
              <div className="rounded-lg bg-card/40 p-3 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("redemption.code", { defaultValue: "Code" })}
                </p>
                <code className="mt-2 block font-mono text-lg font-bold text-primary text-center">
                  {qrPreview.redemption.redemptionCode}
                </code>
              </div>

              {/* Info */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
                {t("redemption.walletOfflineNote", {
                  defaultValue:
                    "⚠️ QR usable offline - No internet connection needed",
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
