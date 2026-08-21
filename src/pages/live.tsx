import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  IndianRupee,
} from "lucide-react";
import { io } from "socket.io-client";
import { BACKEND_URL, TOTAL_PLAYER, roomId } from "../constants";
import bellGif from '../assets/bell.gif';
import congratsJif from '../assets/congratulations.gif';
import clapJif from '../assets/clap.gif'
import playerBg from '../assets/aution_card.jpeg'
import TeamTable from "./TeamTable";
import Accordion from 'react-bootstrap/Accordion';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loader from "react-js-loader";
import bklogo from '../assets/bk_logo.jpeg'
import auctionIcon from '../assets/icon.png'
import PlayerService from "@/service/PlayerService";
import { ToastContainer, toast } from 'react-toastify';





export default function AuctionDashboard() {

  const [openTeam, setOpenTeam] = useState<string | null>(null);
  const isMobile = window.innerWidth < 768;


  const [socket, setSocket] = useState<any>(null);
  const [currentBidPlayer, setCurrentPlayer] = useState<any>({});
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


  useEffect(() => {
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

      })
    } catch (err) {

    }
  }




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
        setCurrentPlayer(parseData(message));
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


  const handleAccordionSelect = async (eventKey: any) => {
    console.log("eventKey== ", eventKey)
    if (!eventKey) return;

    try {
      if (!playersByTeam[eventKey]) {
        setIsLoading(true)
      }

      setLoadingTeam(eventKey);
      let params = {
        offset: 0,
        teamId: eventKey
      }
      PlayerService().getAllPlayers(params).then((response: any) => {
        setIsLoading(false)
        setLoadingTeam(null);
        let playerList = response?.data?.players;
        console.log("playerList== ", playerList)
        setPlayersByTeam((prev: any) => ({
          ...prev,
          [eventKey]: playerList,
        }));
      })

    } finally {
      setLoadingTeam(null);
    }
  };



  const handleTeamClick = (teamId: string) => {

    if (openTeam === teamId) {
      setOpenTeam(null);
      return;
    }

    setOpenTeam(teamId);
    handleAccordionSelect(teamId);
  };


  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">


      {/* TOP STAT BAR */}
      <div className="
         top-0 z-50
        border-b border-slate-700
        bg-slate-950/90 backdrop-blur
      ">

        <div className="
          mx-auto max-w-7xl
          px-4 py-2
        ">

          <div className="
            grid
            grid-cols-3
            md:grid-cols-4
            gap-4
          ">

            <StatCard
              title="SOLD"
              value={soldCount}
              color="text-green-400"
            />


            <StatCard
              title="UNSOLD"
              value={unSoldCount}
              color="text-red-400"
            />


            <StatCard
              title="PENDING"
              value={pendingCount}
              color="text-yellow-400"
            />

          </div>

        </div>

      </div>



      <div className="
        mx-auto
        max-w-7xl
        p-6
        space-y-6
      ">


  {/* <div
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
</div> */}

        {/* CURRENT PLAYER CARD */}

         {
          currentBidPlayer &&
          (



            <div className="
  md:col-span-2
  flex
  justify-center
  p-4
  sm:p-6
">

              <div className="
    relative
    w-full
    max-w-[360px]
    overflow-hidden
    rounded-3xl
    border-4
    border-yellow-400
    shadow-2xl
  ">


                <img
                  src={`https://storage.googleapis.com/rajas_pl/${currentBidPlayer.profile_image}`}
                  alt={currentBidPlayer.fullname}
                  className="
        w-full
        aspect-[3/4]
        object-cover
      "
                />



                <div className="
      absolute
      bottom-0
      left-0
      w-full
      p-3
      sm:p-5
      bg-gradient-to-t
      from-black/95
      via-black/60
      to-transparent
      text-white
    ">


                  <h2 className="
        text-xl
        sm:text-2xl
        md:text-3xl
        font-black
        uppercase
        truncate
        drop-shadow-lg
      ">
                    {currentBidPlayer.fullname}
                  </h2>


                  <div className="
        mt-2
        flex
        justify-between
        gap-3
        text-xs
        sm:text-sm
      ">


                    <div>

                      <p className="
            text-yellow-400
            font-bold
          ">
                        ROLE
                      </p>

                      <p className="
            font-semibold
            truncate
            max-w-[120px]
          ">
                        {currentBidPlayer.player_role}
                      </p>

                    </div>



                    <div>

                      <p className="
            text-yellow-400
            font-bold
          ">
                        ID
                      </p>

                      <p className="font-semibold">
                        #{currentBidPlayer.id}
                      </p>

                    </div>


                  </div>



                  <div className="
        mt-3
        flex
        flex-wrap
        gap-2
      ">


                    <span className="
          rounded-full
          bg-white/20
          px-2
          sm:px-3
          py-1
          text-[10px]
          sm:text-xs
          backdrop-blur
          whitespace-nowrap
        ">

                      🏏 {currentBidPlayer.batting_style}

                    </span>



                    <span className="
          rounded-full
          bg-white/20
          px-2
          sm:px-3
          py-1
          text-[10px]
          sm:text-xs
          backdrop-blur
          whitespace-nowrap
        ">

                      🎯 {currentBidPlayer.bowling_style}

                    </span>


                  </div>


                </div>


              </div>

            </div>

          )
        } 




        {/* CURRENT BID */}


        {/* {currentCall &&
          (

            <div className="
    rounded-2xl
    md:rounded-3xl
    bg-gradient-to-r
    from-blue-700
    via-indigo-700
    to-purple-700
    p-4
    sm:p-5
    md:p-6
    shadow-xl
  "
            >

              <div
                className="
      flex
      flex-col
      sm:flex-row
      items-center
      justify-between
      gap-4
      sm:gap-6
    "
              >

                <div className="text-center sm:text-left">
                  <p
                    className="
          text-xs
          sm:text-sm
          uppercase
          tracking-wider
          text-blue-200
        "
                  >
                    Current Bid Team
                  </p>

                  <h2
                    className="
          mt-1
          text-2xl
          sm:text-3xl
          lg:text-4xl
          font-black
          break-words
        "
                  >
                    {currentCall.team_name}
                  </h2>
                </div>

                <div
                  className="
        flex
        items-center
        justify-center
        gap-1
        sm:gap-2
        text-3xl
        sm:text-4xl
        lg:text-5xl
        font-black
        text-yellow-300
      "
                >

                  <span>{currentCall.amount}</span>
                </div>
              </div>
            </div>

          )
        } */}




        {/* TEAM LIST */}


        <div className="space-y-4">
          {allTeams.map((team: any) => {
            const expanded = openTeam === String(team.id);

            return (
              <div
                key={team.id}
                className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-lg"
              >
                {/* Team Header */}
                <button
                  onClick={() => handleTeamClick(String(team.id))}
                  className="
            w-full
            bg-gradient-to-r
            from-slate-800
            to-blue-900
            p-4
            sm:p-5
            transition
            hover:brightness-110
          "
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Team Name */}
                    <div className="text-left">
                      <h2 className="text-xl sm:text-2xl font-bold break-words">
                        {team.team_name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-300">
                        {team.player_count} Players
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
                      <div className="text-center">
                        <p className="text-xs uppercase text-slate-400">
                          Points
                        </p>

                        <p className="text-lg sm:text-xl font-bold">
                          {team.total_points}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-xs uppercase text-slate-400">
                          Purse
                        </p>

                        <p className="text-lg sm:text-xl font-bold text-green-400">
                          ₹{team.max_bid_amount?.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center">
                        {expanded ? (
                          <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" />
                        ) : (
                          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded Players */}
               {expanded && (
  <div className="w-full overflow-x-hidden rounded-xl border border-slate-700">

    <table className="w-full table-fixed border-collapse">

      <thead className="sticky top-0 z-10 bg-slate-800">
        <tr className="text-slate-300 uppercase">

          <th className="w-[65%] px-2 sm:px-3 py-2 text-left text-[11px] sm:text-sm font-semibold">
            Player
          </th>

          <th className="w-[35%] px-2 sm:px-3 py-2 text-right text-[11px] sm:text-sm font-semibold">
            Bid Amount
          </th>

        </tr>
      </thead>

      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={2} className="py-8">
              <div className="flex justify-center items-center">
                <Loader
                  type="spinner-cub"
                  bgColor="gold"
                  color="gold"
                  title="Loading..."
                  size={40}
                />
              </div>
            </td>
          </tr>
        ) : (playersByTeam[String(team.id)] || []).length > 0 ? (
          (playersByTeam[String(team.id)] || []).map(
            (player: any, index: number) => (
              <tr
                key={player.id}
                className={
                  index % 2 === 0
                    ? "bg-slate-900"
                    : "bg-slate-800/70"
                }
              >

                <td className="w-[65%] px-2 sm:px-3 py-2">
                  <div
                    className="truncate font-semibold text-xs sm:text-sm"
                    title={player.fullname}
                  >
                    #{player.id}. {player.fullname}
                  </div>
                </td>

                <td className="w-[35%] px-2 sm:px-3 py-2 text-right font-bold text-yellow-400 text-xs sm:text-sm">
                  {player.bid_amount?.toLocaleString()}
                </td>

              </tr>
            )
          )
        ) : (
          <tr>
            <td
              colSpan={2}
              className="py-6 text-center text-slate-400 text-sm"
            >
              No players available
            </td>
          </tr>
        )}
      </tbody>

    </table>

  </div>
)}
              </div>
            );
          })}
        </div>



      </div>


    </div>

  );

}





function StatCard({
  title,
  value,
  color
}: any) {

  return (

    <div className="
      rounded-xl
      border
      border-slate-700
      bg-slate-900
      px-3
      py-2
      text-center
      shadow-md
    ">

      <p className="
        text-xs
        uppercase
        tracking-wide
        text-slate-400
      ">
        {title}
      </p>


      <p className={`
        mt-1
        text-2xl
        font-black
        ${color}
      `}>
        {value}
      </p>

    </div>

  );

}




function Info({
  title,
  value
}: any) {

  return (

    <div className="
      rounded-2xl
      border
      border-slate-700
      bg-slate-800/80
      p-5
    ">


      <p className="
        text-xs
        uppercase
        text-slate-400
      ">

        {title}

      </p>


      <p className="
        mt-2
        text-2xl
        font-bold
      ">

        {value || "-"}

      </p>


    </div>

  );

}