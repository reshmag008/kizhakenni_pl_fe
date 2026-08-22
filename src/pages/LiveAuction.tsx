import React, { useState,useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Radio,
  Users,
  Trophy,
  Clock3,
  CircleDollarSign,
} from "lucide-react";
import PlayerService from "@/service/PlayerService";
import { io } from "socket.io-client";
import { BACKEND_URL, TOTAL_PLAYER, roomId } from "../constants";

import { toast } from 'sonner';







const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const LiveAuction: React.FC = () => {
  const [openTeam, setOpenTeam] = useState<string | null>(null);

  


  const isMobile = window.innerWidth < 768;


  const [socket, setSocket] = useState<any>(null);
  const [currentBidPlayer, setcurrentBidPlayer] = useState<any>({});
  const [currentBid, setCurrentBid] = useState<any>({});
  const [currentCall, setCurrentCall] = useState<any>({});
  const [soldPlayer, setSoldPlayer] = useState<any>({});
  const [allSoldPlayers, setAllSoldPlayer] = useState<any>([])
  const [popUpContent, setPopUpContent] = useState<any>({})
  const [openPopUp, setOpenPopUp] = useState(false);
  const [allTeams, setAllTeams] = useState<any>([])
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [soldCount, setSoldCount] = useState(0);
  const [unSoldCount, setUnSoldCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const [playersByTeam, setPlayersByTeam] = useState<any>({});
  const [loadingTeam, setLoadingTeam] = useState<string | null>(null);
  const [auctionStatus, setAuctionStatus] = useState<string>('LIVE');

  useEffect(() => {

    setAuctionStatus('LIVE')
    
    const newSocket = io(BACKEND_URL, {
      transports: ["websocket"], // 👈 prefer websocket only
      withCredentials: true,

      reconnection: true,
      reconnectionAttempts: Infinity,   // 👈 keep trying
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    setSocket(newSocket);

    getSoldPlayers();
    GetAllTeams();
    GetAllPlayers();

    // 👇 Connection logs (VERY IMPORTANT)
    newSocket.on("connect", () => {
      console.log("Connected:", newSocket.id);
       newSocket.emit("join-room", roomId);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
    });

    newSocket.on("reconnect_attempt", () => {
      console.log("Reconnecting...");
    });

    newSocket.on("reconnect", () => {
      console.log("Reconnected!");
      newSocket.emit("join-room", roomId);
      // 👇 Re-fetch data after reconnect
      getSoldPlayers();
      GetAllTeams();
      GetAllPlayers();
    });
    const handleFocus = () => {
      if (!newSocket.connected) {
        console.log("Focus reconnect...");
        newSocket.connect();
        newSocket.emit("join-room", roomId);
      }
    };

    const interval = setInterval(() => {
      if (!newSocket.connected) {
        console.log("Heartbeat reconnect...");
        newSocket.connect();
        newSocket.emit("join-room", roomId);
      }
    }, 5000);


    // ✅ 🔥 HANDLE MOBILE SCREEN OFF / ON
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("App came back to foreground");
        console.log(newSocket.connected)
        if (!newSocket.connected) {
          console.log("Manually reconnecting...");
          newSocket.connect();
          newSocket.emit("join-room", roomId);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      newSocket.off();
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log("Updated playersByTeam:", playersByTeam);
    setPlayersByTeam(playersByTeam)
  }, [playersByTeam]);


  const GetAllPlayers = async () => {
    try {
      let params = {
        offset: 0,
        teamId: null
      }
      PlayerService().getAllPlayers(params).then((response: any) => {
        setSoldCount(response?.data?.soldPlayerCount);
        setUnSoldCount(response?.data?.unSoldPlayerCount);
        setPendingCount(response?.data?.pendingPlayerCount);

        if(response?.data?.unSoldPlayerCount==0 && response?.data?.pendingPlayerCount==0){
            setAuctionStatus("COMPLETE");
        }

      })
    } catch (err) {

    }
  }

   const stats = [
    {
      label: "Pending",
      value: pendingCount,
      icon: Clock3,
      className: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Sold",
      value: soldCount,
      icon: Trophy,
      className: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Unsold",
      value: unSoldCount,
      icon: Users,
      className: "text-red-400",
      bg: "bg-red-400/10",
    }
  ];

  const handleTeamClick = (teamId: string | number) => {
    const id = String(teamId);

    setOpenTeam((current) => (current === id ? null : id));

    handleAccordionSelect(teamId);

  };


 const handleAccordionSelect = async (teamId: any) => {
  const id = String(teamId);

  try {
    setLoadingTeam(id);

    if (!playersByTeam[id]) {
      setIsLoading(true);

      const params = {
        offset: 0,
        teamId: id,
      };

      const response: any = await PlayerService().getAllPlayers(params);

      const playerList = response?.data?.players || [];

      console.log("teamId:", id);
      console.log("playerList:", playerList);

      setPlayersByTeam((prev: any) => ({
        ...prev,
        [id]: playerList,
      }));

      setIsLoading(false);
    }
  } catch (error) {
    console.error("Failed to load team players:", error);
  } finally {
    setLoadingTeam(null);
    setIsLoading(false);
  }
};



  const parseData = (data: any) => {
    return typeof data === "string" ? JSON.parse(data) : data;
  };

  useEffect(() => {
    if (socket) {

      // socket.emit("join-room", roomId);

      socket.on('current_bid', (message: any) => {
        console.log("message== ", message);
        // setCurrentBid(message)
        setCurrentBid(parseData(message));
      })

      // socket.join(roomId);
      socket.on("current_player", (message: any) => {
        console.log("current_player ---- ", message);
        setSoldPlayer({});
        setCurrentCall({})
        setcurrentBidPlayer(parseData(message));
      });
      socket.on("team_call", (message: any) => {
        console.log("team_call ---- ", message);
        setSoldPlayer({});
        setCurrentCall(parseData(message));
      });
      socket.on("player_sold", (message: any) => {
        console.log("player_sold ---- ", message);
        let player = JSON.parse(message)
        setSoldPlayer(player);
        setCurrentCall({})
        toast.success(`${player.player_name} sold to ${player.team_name} for ${player.bid_amount}`)
        getSoldPlayers();
        GetAllTeams();
        GetAllPlayers();
      });

      socket.on("team_complete", (message: any) => {
        setOpenPopUp(true);
        setPopUpContent(JSON.parse(message));
        setTimeout(()=>{
            setOpenPopUp(false);
        },3000)
      })

      socket.on("close_popup", (message: any) => {
        setOpenPopUp(false);
      })


    }
  }, [socket]);


  const GetAllTeams = () => {
    try {
      PlayerService()
        .getAllTeams()
        .then((response: any) => {
          setAllTeams(response?.data);
        });
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const capitalizeFirst = (str: any) => {
    if (!str) return "";
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }



  const getSoldPlayers = () => {

    PlayerService().getSoldPlayers().then((response: any) => {
      setAllSoldPlayer(response?.data?.players);
    })
  }


  

  

  return (
    <div className="min-h-screen bg-[#070b14] text-white">

        {soldPlayer?.id && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="sold-stamp">
            SOLD
            </div>
        </div>
        )}




          {openPopUp && (
  <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
    {/* Popup */}
    <div className="pointer-events-auto relative animate-in zoom-in-90 fade-in duration-300">
      <div className="relative w-[320px] overflow-hidden rounded-3xl border border-emerald-400/30 bg-[#0b1220]/95 px-6 py-6 text-center shadow-2xl shadow-emerald-500/20 backdrop-blur-xl sm:w-[380px]">

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setOpenPopUp(false)}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Glow */}
        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="relative">

      
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
            Congratulations!
          </p>

          {/* Team Logo */}
          <div className="mx-auto mt-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg">
            {popUpContent.team_logo ? (
              <img
                src={`https://storage.googleapis.com/rajas_pl/${popUpContent.team_logo}`}
                alt={popUpContent.team_name}
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <span className="text-3xl">🏆</span>
            )}
          </div>

          {/* Team Name */}
          <h2 className="mt-3 text-2xl font-black text-white">
            {popUpContent.team_name}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Squad completed successfully!
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-lg">🏆</span>

            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Auction Complete
            </span>

            <span className="text-lg">🏆</span>
          </div>
        </div>

        {/* Auto-close progress */}
        <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden bg-white/5">
          <div className="h-full animate-[shrink_4s_linear_forwards] bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
        </div>
      </div>
    </div>
  </div>
)}

          

      <main className="mx-auto max-w-[1800px] space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* AUCTION COUNTERS */}
        {/* ========================================================= */}


{auctionStatus == 'LIVE' && 

        <section className="grid grid-cols-3 gap-2 sm:gap-3">
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 sm:px-4 sm:py-3">
  <div className="flex items-center justify-between gap-2">
    <div>
      <p className="text-[9px] font-medium uppercase tracking-wider text-emerald-400 sm:text-[10px]">
        Sold
      </p>

      <p className="mt-0.5 text-lg font-black leading-none text-emerald-300 sm:text-xl">
        {soldCount}
      </p>
    </div>
  </div>

  <div className="absolute bottom-0 left-0 h-[2px] w-full bg-emerald-500" />
</div>


     <div className="relative overflow-hidden rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 sm:px-4 sm:py-3">
  <div className="flex items-center justify-between gap-2">
    <div>
      <p className="text-[9px] font-medium uppercase tracking-wider text-orange-400 sm:text-[10px]">
        Pending
      </p>

      <p className="mt-0.5 text-lg font-black leading-none text-orange-300 sm:text-xl">
        {pendingCount}
      </p>
    </div>
  </div>

  <div className="absolute bottom-0 left-0 h-[2px] w-full bg-orange-500" />
</div>

      <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 sm:px-4 sm:py-3">
  <div className="flex items-center justify-between gap-2">
    <div>
      <p className="text-[9px] font-medium uppercase tracking-wider text-red-400 sm:text-[10px]">
        Unsold
      </p>

      <p className="mt-0.5 text-lg font-black leading-none text-red-300 sm:text-xl">
        {unSoldCount}
      </p>
    </div>
  </div>

  <div className="absolute bottom-0 left-0 h-[2px] w-full bg-red-500" />
</div>

    
 
</section>
}

        {/* ========================================================= */}
        {/* MAIN AUCTION AREA */}
        {/* ========================================================= */}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          {/* PLAYER SECTION */}
{auctionStatus == 'COMPLETE' && 
           <div
  className="
    mt-3
    flex items-center justify-center
    rounded-xl
    border-2 border-cyan-400/40
    bg-gradient-to-r from-cyan-500/10 via-indigo-500/20 to-violet-500/10
    px-6 py-3
    shadow-[0_0_20px_rgba(34,211,238,0.12)]
  "
>
  <div className="flex items-center gap-3">

    <span className="text-xl">🏆</span>

    <div>
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
        AUCTION
      </p>

      <p className="text-xl md:text-2xl font-black uppercase text-white leading-none">
        COMPLETED
      </p>
    </div>

  </div>

</div>
}

        {auctionStatus == 'LIVE' && currentBidPlayer?.id &&
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1320] shadow-2xl">
            {/* Player Image */}

            <div className="relative min-h-[500px] overflow-hidden sm:min-h-[620px] lg:min-h-[680px]">
              {currentBidPlayer.profile_image ? (
                <img
                  src={`https://storage.googleapis.com/rajas_pl/${currentBidPlayer.profile_image}`}
                  alt={currentBidPlayer.fulllname}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                  <Users className="h-32 w-32 text-slate-700" />
                </div>
              )}

              {/* Image gradients */}

              <div className="absolute inset-0 bg-gradient-to-t from-[#080c16] via-[#080c16]/30 to-transparent" />

              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

              {/* Player ID */}

              <div className="absolute left-5 top-5 rounded-full border border-red/20 bg-black/40 px-4 py-2 text-xs font-bold backdrop-blur-md sm:left-7 sm:top-7">
                PLAYER #{currentBidPlayer.id}
              </div>

              

              {/* Player Details */}

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 lg:p-9">
                <div className="max-w-3xl">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
                    Current Player
                  </p>

                  <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                    {currentBidPlayer.fullname}
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {currentBidPlayer.player_role && (
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                        {currentBidPlayer.player_role}
                      </span>
                    )}

                    {currentBidPlayer.batting_style && (
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                        🏏 {currentBidPlayer.batting_style}
                      </span>
                    )}

                    {currentBidPlayer.bowling_style && (
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                        ⚾ {currentBidPlayer.bowling_style}
                      </span>
                    )}

                    {currentBidPlayer.location && (
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                        📍 {currentBidPlayer.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================== */}
            {/* CURRENT BID */}
            {/* ===================================================== */}
            {currentCall.team_name && 
            <div className="border-t border-white/10 bg-gradient-to-r from-[#111827] to-[#0d1320] p-5 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                    <CircleDollarSign className="h-4 w-4 text-amber-400" />
                    Current Bid
                  </div>

                  <div className="mt-1 text-4xl font-black text-amber-400 sm:text-5xl">
                    {formatAmount(currentCall.amount)}
                  </div>
                </div>

                {currentBid && (
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3">
                    <p className="text-xs uppercase tracking-wider text-emerald-400/70">
                      Highest Bid
                    </p>

                    <p className="mt-1 font-bold text-emerald-300">
                      {
                        currentCall.team_name
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
            }
          </div>

            }

          {/* ========================================================= */}
          {/* TEAM SECTION */}
          {/* ========================================================= */}

          <aside className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Teams</h2>
                <p className="text-xs text-slate-500">
                  Click a team to view selected players
                </p>
              </div>

              <div className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400">
                {allTeams.length} Teams
              </div>
            </div>

            <div className="space-y-3">
              {allTeams.map((team: any, index: number) => {
               const expanded = openTeam === String(team.id);
                const teamId = String(team.id);

                return (
                  <div
                    key={team.id}
                    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                      expanded
                        ? "border-amber-400/30 bg-[#111827] shadow-lg shadow-black/20"
                        : "border-white/10 bg-white/[0.035] hover:border-white/20"
                    }`}
                  >
                    {/* Team Header */}

                    <button
                      type="button"
                      onClick={() => handleTeamClick(team.id)}
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      {/* Team Logo */}

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-800">
                        {team.team_logo ? (
                          <img
                            src={`https://storage.googleapis.com/rajas_pl/${team.team_logo}`}
                            alt={team.team_name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Trophy className="h-5 w-5 text-amber-400" />
                        )}
                      </div>

                      {/* Team Info */}

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold">{team.team_name}</h3>

                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <span>
                            {team.player_count || 0} Players
                          </span>

                          {team.max_bid_amount !== undefined && (
                            <>
                              <span>•</span>
                              <span>
                                {formatAmount(team.max_bid_amount)} left
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expand */}

                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                          expanded
                            ? "bg-amber-400/10 text-amber-400"
                            : "bg-white/5 text-slate-400"
                        }`}
                      >
                        {expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </button>

                    {/* Team Players */}

                   {expanded && (
  <div className="border-t border-white/10">
    {loadingTeam === teamId ? (
      <div className="px-4 py-6 text-center text-sm text-slate-500">
        Loading players...
      </div>
    ) : playersByTeam[teamId]?.length > 0 ? (
      <div className="divide-y divide-white/5">
        {playersByTeam[teamId].map((player: any) => (
          <div
            key={player.id}
            className="flex items-center gap-3 px-4 py-3"
          >
            {/* Player image */}
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-800">
              {player.profile_image ? (
                <img
                  src={`https://storage.googleapis.com/rajas_pl/${player.profile_image}`}
                  alt={player.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Users className="h-4 w-4 text-slate-600" />
                </div>
              )}
            </div>

            {/* Player */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {player.fullname}
              </p>

              <p className="text-xs text-slate-500">
                {player.player_role || "Player"}
              </p>
            </div>

            {/* Price */}
            {player.bid_amount !== undefined && (
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-400">
                  {player.bid_amount}
                </p>

                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                  Sold
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="px-4 py-6 text-center text-sm text-slate-500">
        No players selected yet
      </div>
    )}
  </div>
)}
                  </div>
                );
              })}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default LiveAuction;