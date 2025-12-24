import { AppLayout } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EduCoin, EduCoinDisplay } from "@/components/ui/edu-coin";
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
import { useState, useRef, useMemo } from "react";
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
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showHistory, setShowHistory] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeemedItem, setRedeemedItem] = useState<string>("");
  const [redeemedPrice, setRedeemedPrice] = useState(0);
  const [isSpending, setIsSpending] = useState(false);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const { balance, earned, spent, transactions, addTransaction } = useWallet();
  const { playSuccess } = useSoundEffects();

  const currentBalance = balance;

  // Get products for current filter
  const displayProducts = useMemo(() => {
    return getProductsByFilter(activeFilter);
  }, [activeFilter]);

  const handleRedeem = (product: (typeof comprehensiveRewardsCatalog)[0]) => {
    if (currentBalance >= product.educoinsCost) {
      setIsSpending(true);

      // Update wallet with redemption
      addTransaction(product.educoinsCost, "spend", `Redeemed: ${product.name}`);

      playSuccess?.();
      setRedeemedItem(product.name);
      setRedeemedPrice(product.educoinsCost);
      setShowSuccess(true);
      setIsSpending(false);
      setTimeout(() => setShowSuccess(false), 4000);
      toast.success(`🎉 You redeemed ${product.name}!`);
    } else {
      const needed = coinsToUnlock(currentBalance, product.educoinsCost);
      toast.error(`Need ${needed} more EduCoins!`);
    }
  };

  return (
    <AppLayout role="student" playCoins={currentBalance} title="Rewards Marketplace">
      <style>{`
        /* Product Card Price Coin - Compact inline icon */
        .edu-coin-product-price {
          width: 18px !important;
          height: 18px !important;
        }

        @media (max-width: 640px) {
          .accent-blur-bg {
            width: 249px !important;
            height: 327px !important;
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
          .hero-coin-image {
            margin: 0 auto !important;
          }
          .edu-coin-product-price {
            width: 16px !important;
            height: 16px !important;
          }
        }
      `}</style>
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
                <h3 className="font-display text-3xl text-foreground">Awesome!</h3>
                <Sparkles className="h-6 w-6 text-accent animate-pulse" />
              </div>

              <p className="text-lg text-muted-foreground mb-2">You earned this by learning!</p>

              <p className="text-base text-accent font-bold mb-4">{redeemedItem}</p>

              <div className="bg-secondary/10 rounded-xl p-3 mb-6 flex items-center justify-center gap-2">
                <EduCoin size="sm" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-secondary">{redeemedPrice}</span> EduCoins Spent
                </p>
              </div>

              <p className="text-sm text-muted-foreground/70 mb-6">
                Your reward will be delivered soon 🎁
              </p>

              <Button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:from-accent/90 hover:to-accent/70"
              >
                <Check className="h-4 w-4 mr-2" />
                Continue Shopping
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
            <div className="relative mb-8 slide-up">
              {/* Primary Wallet Bar */}
              <div className="flex flex-row">
                <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-6 mb-6 border border-accent/20">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground mb-1 font-bold">Balance</p>
                      <div className="flex flex-row items-center gap-3">
                        <h2 className="font-display text-4xl font-bold text-accent">
                          {currentBalance.toLocaleString()}
                        </h2>
                        <EduCoin size="lg" imgClassName="edu-coin-balance-lg" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">EduCoins</p>
                    </div>
                  </div>
                </div>
                <img
                  loading="lazy"
                  srcSet="https://cdn.builder.io/api/v1/image/assets%2Fa9d627de7a0c400a9a5045a9ca4a12ea%2Fbf3bd7389fad4f3289ccdf4eaf5e5789?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2Fa9d627de7a0c400a9a5045a9ca4a12ea%2Fbf3bd7389fad4f3289ccdf4eaf5e5789?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2Fa9d627de7a0c400a9a5045a9ca4a12ea%2Fbf3bd7389fad4f3289ccdf4eaf5e5789?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2Fa9d627de7a0c400a9a5045a9ca4a12ea%2Fbf3bd7389fad4f3289ccdf4eaf5e5789?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2Fa9d627de7a0c400a9a5045a9ca4a12ea%2Fbf3bd7389fad4f3289ccdf4eaf5e5789?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2Fa9d627de7a0c400a9a5045a9ca4a12ea%2Fbf3bd7389fad4f3289ccdf4eaf5e5789?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2Fa9d627de7a0c400a9a5045a9ca4a12ea%2Fbf3bd7389fad4f3289ccdf4eaf5e5789?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2Fa9d627de7a0c400a9a5045a9ca4a12ea%2Fbf3bd7389fad4f3289ccdf4eaf5e5789"
                  style={{
                    aspectRatio: "1.07",
                    objectFit: "contain",
                    objectPosition: "center",
                    width: "100%",
                    marginLeft: "20px",
                    minHeight: "20px",
                    minWidth: "20px",
                    overflow: "hidden",
                  }}
                  className="max-sm:max-w-[140px] max-sm:m-0 max-sm:ml-[7px] hero-coin-image"
                />
              </div>

              {/* Secondary Stats Row - Glass Cards */}
              <div className="flex gap-4">
                {/* Earned Card */}
                <div className="flex-1 glass-card rounded-xl p-4 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2 font-bold">Earned</p>
                  <div className="flex items-center gap-2">
                    <p className="font-heading text-2xl font-bold text-secondary">
                      {earned.toLocaleString()}
                    </p>
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
                        width: "35px",
                      }}
                    />
                  </div>
                </div>

                {/* Spent Card */}
                <div className="flex-1 glass-card rounded-xl p-4 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2 font-bold">Spent</p>
                  <div className="flex items-center gap-2">
                    <p className="font-heading text-2xl font-bold text-primary">
                      {spent.toLocaleString()}
                    </p>
                    <EduCoin
                      size="sm"
                      imgClassName="edu-coin-spent-sm"
                      src="https://cdn.builder.io/api/v1/image/assets%2Fa9d627de7a0c400a9a5045a9ca4a12ea%2F461226e32d554b2c97f6e5a78d92d2bd"
                    />
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
                Redeem Rewards
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
                <p className="text-muted-foreground">No rewards in this category yet</p>
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
                          Almost there!
                        </div>
                      )}

                      {/* Locked Badge */}
                      {!canAfford && !almostThere && (
                        <div className="absolute top-2 right-2 z-10 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Lock className="h-3 w-3" />
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
                              Earn <span className="font-bold text-accent">{coinsNeeded}</span> more
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
                              Locked
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 justify-center">
                              <EduCoin size="sm" />
                              Redeem
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
                <p className="font-medium text-foreground mb-2">Keep Learning, Keep Earning!</p>
                <p className="text-xs text-muted-foreground">
                  Every task, game, and achievement brings you closer to rewards that matter—for you, your
                  family, and your village.
                </p>
              </div>
            </div>
          </>
        ) : (
          /* ============ TRANSACTION HISTORY ============ */
          <div className="slide-up" style={{ animationDelay: "100ms" }}>
            <h3 className="font-heading font-semibold text-xl text-foreground mb-6 flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              Transaction History
            </h3>

            {transactions.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center border border-border">
                <EduCoin size="lg" className="mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-medium">No transactions yet</p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Complete games and tasks to earn EduCoins!
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
                Back to Rewards
              </>
            ) : (
              <>
                <History className="h-4 w-4 mr-2" />
                View History
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
