import { AppLayout } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EduCoin, EduCoinDisplay } from "@/components/ui/edu-coin";
import { useTranslation } from "react-i18next";
import {
  Lock,
  TrendingUp,
  ArrowDownRight,
  History,
  Check,
  Sparkles,
  Loader2,
  Zap,
} from "lucide-react";
import { useState, useRef, useMemo, Suspense, lazy } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import {
  comprehensiveRewardsCatalog,
  getProductsByFilter,
  canAffordReward,
  coinsToUnlock,
  isAlmostThere,
  filterMetadata,
  FilterType,
} from "@/data/comprehensive-rewards-catalog";
import mascotCelebrate from "@/assets/mascot-celebrate.png";
import mascotExcited from "@/assets/mascot-excited.png";
import { RedemptionConfirmationModal } from "@/components/student/RedemptionConfirmationModal";
import { QRGenerationLoading } from "@/components/student/QRGenerationLoading";
import { QRResultScreen } from "@/components/student/QRResultScreen";
import { MyRedeemedRewardsScreen } from "@/components/student/MyRedeemedRewardsScreen";
import { createRedemptionData } from "@/lib/qr-utils";
import type { RedemptionData } from "@/lib/qr-utils";

// Lazy load QRCode component since it depends on qrcode.react
let QRCodeComponent: any = null;
try {
  const QRCode = require("qrcode.react").default;
  QRCodeComponent = QRCode;
} catch (e) {
  // qrcode.react not installed yet
  QRCodeComponent = null;
}

// Filter list in exact order as specified
const FILTER_ORDER: FilterType[] = [
  "all",
  "stationery",
  "study_purpose",
  "household_needs",
  "farming_needs",
  "premium",
  "study_kits",
  "upskilling_books",
  "community_building",
];

export default function RewardsPage() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showHistory, setShowHistory] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeemedItem, setRedeemedItem] = useState<string>("");
  const [redeemedPrice, setRedeemedPrice] = useState(0);
  const [isSpending, setIsSpending] = useState(false);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  // QR Redemption Flow States
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showQRResultScreen, setShowQRResultScreen] = useState(false);
  const [showMyRewardsScreen, setShowMyRewardsScreen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<(typeof comprehensiveRewardsCatalog)[0] | null>(null);
  const [generatedRedemption, setGeneratedRedemption] = useState<RedemptionData | null>(null);
  const [savedRedemptions, setSavedRedemptions] = useState<RedemptionData[]>([]);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' && navigator.onLine);

  const { balance, earned, spent, transactions, addTransaction } = useWallet();
  const { playSuccess } = useSoundEffects();

  const currentBalance = balance;

  // Get products for current filter
  const displayProducts = useMemo(() => {
    return getProductsByFilter(activeFilter);
  }, [activeFilter]);

  // Handle redemption confirmation - shows confirmation modal
  const handleRedeemClick = (product: (typeof comprehensiveRewardsCatalog)[0]) => {
    setSelectedProduct(product);
    setShowConfirmationModal(true);
  };

  // Handle confirmation - starts loading sequence
  const handleConfirmRedemption = async () => {
    if (!selectedProduct) return;

    setShowConfirmationModal(false);
    setShowLoadingModal(true);

    // Simulate 5-second QR generation process
    setTimeout(() => {
      setShowLoadingModal(false);

      // Create redemption data
      const redemptionData = createRedemptionData(
        "student_" + Date.now(), // Placeholder student ID
        selectedProduct.id,
        selectedProduct.name,
        selectedProduct.educoinsCost
      );

      setGeneratedRedemption(redemptionData);
      // Show QR Result Screen instead of modal
      setShowQRResultScreen(true);
    }, 5000);
  };

  // Handle saving redemption to wallet
  const handleSaveToWallet = () => {
    if (generatedRedemption) {
      // Deduct coins from wallet
      addTransaction(
        generatedRedemption.coinsRedeemed,
        "spend",
        `Redeemed: ${generatedRedemption.productName}`
      );

      // Save to redemptions list
      setSavedRedemptions([...savedRedemptions, generatedRedemption]);

      playSuccess?.();
      toast.success(
        t("redemption.savedToWallet", {
          defaultValue: "Redemption saved to My Rewards!",
        })
      );

      // Close QR screen and stay in marketplace
      setShowQRResultScreen(false);
      setGeneratedRedemption(null);
      setSelectedProduct(null);
    }
  };

  // Handle back from QR Result Screen
  const handleBackFromQR = () => {
    setShowQRResultScreen(false);
    setGeneratedRedemption(null);
    setSelectedProduct(null);
  };

  // Handle opening My Rewards wallet
  const handleOpenMyRewards = () => {
    setShowMyRewardsScreen(true);
  };

  // Handle back from My Rewards
  const handleBackFromMyRewards = () => {
    setShowMyRewardsScreen(false);
  };

  // Handle viewing QR from wallet
  const handleViewQRFromWallet = (redemption: RedemptionData) => {
    setGeneratedRedemption(redemption);
    setShowQRResultScreen(true);
    setShowMyRewardsScreen(false);
  };

  // Legacy handleRedeem for backward compatibility (simple redemption)
  const handleRedeem = (product: (typeof comprehensiveRewardsCatalog)[0]) => {
    // Now opens QR redemption flow instead
    handleRedeemClick(product);
  };

  return (
    <AppLayout role="student" playCoins={currentBalance} title={t('rewards.rewardsMarketplace')}>
      <style>{`
        /* ============ BALANCE SECTION STYLES ============ */
        .balance-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Primary Balance Card — Single Horizontal Card */
        .balance-card-primary {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 24px;
          border-radius: 24px;
          border: 0.8px solid rgba(5, 179, 214, 0.2);
          background: linear-gradient(to right, rgba(5, 179, 214, 0.1), rgba(149, 96, 240, 0.1));
          padding: 20px 24px;
          position: relative;
          min-height: 140px;
        }

        .balance-content {
          display: flex;
          flex-direction: column;
          gap: 0;
          font-weight: 400;
          flex: 1;
          justify-content: center;
        }

        .balance-label {
          color: rgb(138, 148, 168);
          font-size: 14px;
          font-weight: 700;
          line-height: 20px;
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }

        @media (max-width: 640px) {
          .balance-label {
            font-family: "Nunito, sans-serif";
          }
        }

        .balance-amount-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 6px;
        }

        .balance-amount {
          font-size: 36px;
          font-weight: 700;
          line-height: 40px;
          color: rgb(5, 179, 214);
          letter-spacing: -0.5px;
          font-family: "Fredoka", sans-serif;
        }

        .balance-coin {
          flex-shrink: 0;
          display: inline-flex;
          align-items: flex-end;
          margin-bottom: 4px;
        }

        .balance-unit {
          color: rgb(138, 148, 168);
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
        }

        @media (max-width: 640px) {
          .balance-unit {
            font-family: "Nunito, sans-serif";
          }
        }

        .balance-mascot-img {
          display: block;
          width: 120px;
          max-width: 120px;
          aspect-ratio: 1.07 / 1;
          object-fit: contain;
          flex-shrink: 0;
          margin: 0;
          align-self: center;
        }

        /* Secondary Stats Cards */
        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .stat-card {
          backdrop-filter: blur(12px);
          background: linear-gradient(145deg, rgba(33, 27, 45, 0.8), rgba(23, 19, 32, 0.9));
          border: 0.8px solid rgba(60, 51, 77, 0.5);
          border-radius: 20px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-label {
          color: rgb(138, 148, 168);
          font-size: 12px;
          font-weight: 700;
          line-height: 16px;
          text-transform: capitalize;
          letter-spacing: 0.2px;
        }

        .stat-amount-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .stat-amount {
          font-size: 24px;
          font-weight: 700;
          line-height: 32px;
          font-family: "Fredoka", sans-serif;
        }

        .stat-coin {
          flex-shrink: 0;
          display: inline-flex;
          align-items: flex-end;
          margin-bottom: 2px;
        }

        /* Earned Card - Green theme */
        .earned-card {
          --stat-color: rgb(16, 183, 127);
        }

        .earned-card .stat-amount {
          color: rgb(16, 183, 127);
        }

        /* Spent Card - Purple theme */
        .spent-card {
          --stat-color: rgb(149, 96, 240);
        }

        .spent-card .stat-amount {
          color: rgb(149, 96, 240);
        }

        /* Product Card Price Coin - Compact inline icon */
        .edu-coin-product-price {
          width: 18px !important;
          height: 18px !important;
        }

        /* ============ RESPONSIVE STYLES ============ */
        @media (max-width: 640px) {
          .accent-blur-bg {
            width: 249px !important;
            height: 327px !important;
          }

          .balance-card-primary {
            flex-direction: row;
            padding: 16px 20px;
            gap: 16px;
            min-height: 120px;
          }

          .balance-amount {
            font-size: 32px;
            line-height: 36px;
          }

          .balance-mascot-img {
            width: 100px;
            max-width: 100px;
          }

          .stats-row {
            gap: 12px;
          }

          .stat-card {
            margin-top: 8px;
          }

          .edu-coin-balance-lg {
            width: 30px !important;
          }
          .edu-coin-earned {
            width: 20px !important;
          }
          .edu-coin-spent-sm {
            width: 20px !important;
          }
          .edu-coin-summary img {
            width: 25px !important;
          }
          .edu-coin-product-price {
            width: 16px !important;
            height: 16px !important;
          }
        }
      `}</style>
      {/* ========== QR REDEMPTION FLOW ========== */}
      {/* Confirmation Modal */}
      {selectedProduct && (
        <RedemptionConfirmationModal
          open={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false);
            setSelectedProduct(null);
          }}
          onConfirm={handleConfirmRedemption}
          product={selectedProduct}
          currentBalance={currentBalance}
          isLoading={false}
        />
      )}

      {/* Loading Animation */}
      <QRGenerationLoading isOpen={showLoadingModal} />

      {/* QR Result Screen - Full Page */}
      {showQRResultScreen && generatedRedemption && (
        <QRResultScreen
          redemptionData={generatedRedemption}
          onBack={handleBackFromQR}
          onSaveToWallet={handleSaveToWallet}
          QRCodeComponent={QRCodeComponent}
          isOnline={isOnline}
        />
      )}

      {/* My Redeemed Rewards Screen - QR Wallet */}
      {showMyRewardsScreen && (
        <MyRedeemedRewardsScreen
          redemptions={savedRedemptions}
          onBack={handleBackFromMyRewards}
          onViewQR={handleViewQRFromWallet}
          QRCodeComponent={QRCodeComponent}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 px-4 py-6 pb-28 relative overflow-hidden">
        {/* Animated Background Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-40 accent-blur-bg" />
        <div className="absolute bottom-32 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 opacity-40" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl opacity-30" />

        {/* Success Celebration Modal */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            {/* Confetti Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-confetti-fall"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.08}s`,
                    background: ["#FFD700", "#FF69B4", "#00CED1", "#32CD32", "#FF6347"][
                      i % 5
                    ],
                  }}
                />
              ))}
            </div>

            <div className="relative glass-card rounded-3xl p-8 text-center border border-accent/30 animate-scale-in max-w-sm mx-4 shadow-2xl shadow-accent/30">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-accent/30 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />

              <img
                src={mascotCelebrate}
                alt="Celebration"
                className="w-48 h-48 mx-auto mb-4 object-contain animate-[bounce_1s_ease-in-out_2]"
              />

              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="h-6 w-6 text-accent animate-pulse" />
                <h3 className="font-display text-3xl text-foreground">{t('rewards.awesome')}</h3>
                <Sparkles className="h-6 w-6 text-accent animate-pulse" />
              </div>

              <p className="text-lg text-muted-foreground mb-2">{t('rewards.earnedByLearning')}</p>

              <p className="text-base text-accent font-bold mb-4">{redeemedItem}</p>

              <div className="bg-secondary/10 rounded-xl p-3 mb-6 flex items-center justify-center gap-2">
                <EduCoin size="sm" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-secondary">{redeemedPrice}</span> {t('rewards.eduCoins')} {t('rewards.spent')}
                </p>
              </div>

              <p className="text-sm text-muted-foreground/70 mb-6">
                {t('rewards.awesome')} 🎁
              </p>

              <Button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:from-accent/90 hover:to-accent/70"
              >
                <Check className="h-4 w-4 mr-2" />
                {t('rewards.continueShopping')}
              </Button>
            </div>
          </div>
        )}

        {/* Mascot - Right side (desktop only) */}
        <div className="absolute right-0 top-24 w-32 h-40 opacity-30 pointer-events-none hidden md:block">
          <img
            src={mascotExcited}
            alt=""
            className="w-full h-full object-contain animate-[float_4s_ease-in-out_infinite]"
          />
        </div>

        {!showHistory ? (
          <>
            {/* ============ WALLET SUMMARY SECTION ============ */}
            <div className="balance-section relative mb-8 slide-up">
              {/* ROW 1: Primary Balance Card */}
              <div className="balance-card-primary">
                {/* Left Column: Text Content */}
                <div className="balance-content">
                  <div className="balance-label">{t('rewards.balance')}</div>
                  <div className="balance-amount-row">
                    <span className="balance-amount">{currentBalance.toLocaleString()}</span>
                    <div className="balance-coin">
                      <EduCoin size="lg" imgClassName="edu-coin-balance-lg" />
                    </div>
                  </div>
                  <div className="balance-unit">{t('rewards.eduCoins')}</div>
                </div>

                {/* Right Column: Mascot Illustration */}
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets%2F128ddd532bd34e33805885edbd9b265d%2F9678a1fbc79b466e821d24748b6cf682"
                  alt="Balance Mascot"
                  className="balance-mascot-img"
                />
              </div>

              {/* ROW 2: Secondary Stats Cards (Earned & Spent) */}
              <div className="stats-row">
                {/* Earned Card */}
                <div className="stat-card earned-card">
                  <div className="stat-label">{t('rewards.earned')}&nbsp;📈</div>
                  <div className="stat-amount-row">
                    <span className="stat-amount">{earned.toLocaleString()}</span>
                    <div className="stat-coin">
                      <img
                        alt="EduCoin"
                        width="48"
                        height="48"
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets%2Fa9d627de7a0c400a9a5045a9ca4a12ea%2F461226e32d554b2c97f6e5a78d92d2bd"
                        className="edu-coin-earned"
                        style={{
                          display: "block",
                          aspectRatio: "1 / 1",
                          filter: "drop-shadow(rgba(0, 0, 0, 0.04) 0px 10px 8px) drop-shadow(rgba(0, 0, 0, 0.1) 0px 4px 3px)",
                          objectFit: "contain",
                          width: "24px",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Spent Card */}
                <div className="stat-card spent-card">
                  <div className="stat-label">{t('rewards.spent')} 📉</div>
                  <div className="stat-amount-row">
                    <span className="stat-amount">{spent.toLocaleString()}</span>
                    <div className="stat-coin">
                      <EduCoin
                        size="sm"
                        imgClassName="edu-coin-spent-sm"
                        src="https://cdn.builder.io/api/v1/image/assets%2Fa9d627de7a0c400a9a5045a9ca4a12ea%2F461226e32d554b2c97f6e5a78d92d2bd"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ============ PRIMARY CTA BUTTON ============ */}
            <div className="mb-6 slide-up" style={{ animationDelay: "50ms" }}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-sm"
              >
                {t('rewards.redeemRewards')}
              </Button>
            </div>

            {/* ============ FILTER PILLS ============ */}
            <div
              ref={filterScrollRef}
              className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide slide-up"
              style={{ animationDelay: "100ms" }}
            >
              {FILTER_ORDER.map((filter) => {
                const metadata = filterMetadata[filter];
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === filter
                      ? "bg-primary text-primary-foreground border border-transparent"
                      : "glass-card border border-border text-muted-foreground hover:border-border/50 hover:text-foreground"
                      }`}
                  >
                    <span className="text-lg">{metadata.emoji}</span>
                    <span>{metadata.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ============ FILTER DESCRIPTION ============ */}
            <div className="mb-6 text-center slide-up" style={{ animationDelay: "150ms" }}>
              <p className="text-sm text-muted-foreground italic">
                {filterMetadata[activeFilter]?.description}
              </p>
            </div>

            {/* ============ PRODUCTS GRID ============ */}
            {displayProducts.length === 0 ? (
              <div
                className="glass-card rounded-2xl p-8 text-center border border-border slide-up"
                style={{ animationDelay: "200ms" }}
              >
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">{t('rewards.noRewardsInCategory')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 slide-up" style={{ animationDelay: "200ms" }}>
                {displayProducts.map((product, index) => {
                  const canAfford = canAffordReward(currentBalance, product.educoinsCost);
                  const almostThere = !canAfford && isAlmostThere(currentBalance, product.educoinsCost);
                  const coinsNeeded = coinsToUnlock(currentBalance, product.educoinsCost);

                  return (
                    <Card
                      key={product.id}
                      className={`relative glass-card border overflow-hidden rounded-2xl transition-all duration-300 flex flex-col ${canAfford
                        ? "border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
                        : almostThere
                          ? "border-primary/40 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/15"
                          : "border-border/30 opacity-75"
                        }`}
                      style={{ animationDelay: `${200 + index * 40}ms` }}
                    >
                      {/* Glow effect for affordable or almost-unlocked items */}
                      {(canAfford || almostThere) && (
                        <div
                          className={`absolute inset-0 ${canAfford
                            ? "bg-gradient-to-br from-primary/8 via-transparent to-primary/5"
                            : "bg-gradient-to-br from-primary/5 via-transparent to-primary/3"
                            } pointer-events-none`}
                        />
                      )}

                      {/* Almost There Badge */}
                      {almostThere && (
                        <div className="absolute top-2 right-2 z-10 bg-accent/90 text-accent-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {t('rewards.almostThere')}
                        </div>
                      )}

                      {/* Locked Badge */}
                      {!canAfford && !almostThere && (
                        <div className="absolute top-2 right-2 z-10 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          {t('rewards.locked')}
                        </div>
                      )}

                      <div className="relative p-4 h-full flex flex-col">
                        {/* Product Image - Perfect Square 1:1 */}
                        <div
                          className={`aspect-square w-full mb-3 rounded-xl flex items-center justify-center overflow-hidden bg-cover bg-center border-2 ${canAfford && !almostThere
                            ? "border-primary/30"
                            : almostThere
                              ? "border-primary/20"
                              : "border-muted/30"
                            }`}
                          style={{
                            backgroundImage: `url('${product.image}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          {/* Fallback gradient if image fails to load */}
                          <div
                            className={`absolute inset-0 ${canAfford && !almostThere
                              ? "bg-gradient-to-br from-primary/20 to-primary/10"
                              : almostThere
                                ? "bg-gradient-to-br from-primary/10 to-primary/5"
                                : "bg-gradient-to-br from-muted/20 to-muted/10"
                              }`}
                          />
                        </div>

                        {/* Product Name */}
                        <h3
                          className={`font-heading font-bold text-center text-sm mb-1 line-clamp-2 ${canAfford ? "text-foreground" : "text-muted-foreground"
                            }`}
                        >
                          {product.name}
                        </h3>

                        {/* Product Description */}
                        <p className="text-xs text-muted-foreground text-center mb-auto line-clamp-2">
                          {product.description}
                        </p>

                        {/* Price and Info */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-center gap-1">
                            <EduCoin size="sm" imgClassName="edu-coin-product-price" />
                            <span
                              className={`font-display font-bold text-lg ${canAfford ? "text-accent" : "text-muted-foreground"
                                }`}
                            >
                              {product.educoinsCost}
                            </span>
                          </div>

                          {/* Unlock Progress */}
                          {!canAfford && (
                            <div className="text-xs text-muted-foreground text-center">
                              {t('rewards.earn')} <span className="font-bold text-accent">{coinsNeeded}</span> {t('rewards.more')}
                            </div>
                          )}
                          {canAfford && (
                            <div className="text-xs text-accent text-center font-medium">
                              {product.impact}
                            </div>
                          )}
                        </div>

                        {/* Redeem Button */}
                        <Button
                          onClick={() => handleRedeem(product)}
                          disabled={!canAfford || isSpending}
                          size="sm"
                          className={`w-full rounded-xl transition-all mt-3 ${canAfford
                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                            }`}
                        >
                          {isSpending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : !canAfford ? (
                            <span className="flex items-center gap-1 justify-center">
                              <Lock className="h-3 w-3" />
                              {t('rewards.locked')}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 justify-center">
                              <EduCoin size="sm" />
                              {t('rewards.redeem')}
                            </span>
                          )}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* ============ MOTIVATIONAL FOOTER ============ */}
            <div className="mt-10 text-center slide-up" style={{ animationDelay: "600ms" }}>
              <div className="glass-card rounded-2xl p-6 border border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="text-base">🌟</span>
                </p>
                <p className="font-medium text-foreground mb-2">{t('rewards.keepLearningKeepEarning')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('rewards.motivationalMessage')}
                </p>
              </div>
            </div>
          </>
        ) : (
          /* ============ TRANSACTION HISTORY ============ */
          <div className="slide-up" style={{ animationDelay: "100ms" }}>
            <h3 className="font-heading font-semibold text-xl text-foreground mb-6 flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              {t('rewards.transactionHistory')}
            </h3>

            {transactions.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center border border-border">
                <EduCoin size="lg" className="mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-medium">{t('rewards.noTransactions')}</p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  {t('rewards.completeTasksToEarnCoins')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <Card
                    key={tx.id || index}
                    className="glass-card border border-border/50 p-4 rounded-xl slide-up hover:border-border"
                    style={{ animationDelay: `${100 + index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === "earn"
                          ? "bg-gradient-to-br from-secondary/30 to-secondary/10"
                          : "bg-gradient-to-br from-primary/30 to-primary/10"
                          }`}
                      >
                        {tx.type === "earn" ? (
                          <TrendingUp className="h-5 w-5 text-secondary" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <span
                          className={`font-heading font-bold text-lg ${tx.type === "earn" ? "text-secondary" : "text-primary"
                            }`}
                        >
                          {tx.type === "earn" ? "+" : "-"}{tx.amount}
                        </span>
                        <EduCoin size="sm" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Toggle History/Rewards Button */}
        <div className="fixed bottom-32 left-4 right-4 z-40">
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="outline"
            className="glass-card border border-border text-muted-foreground hover:text-foreground hover:border-border/80 rounded-full w-full"
          >
            {showHistory ? (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t('rewards.backToRewards')}
              </>
            ) : (
              <>
                <History className="h-4 w-4 mr-2" />
                {t('rewards.viewHistory')}
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
