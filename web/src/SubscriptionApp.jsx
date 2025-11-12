
// import React, { useState, useEffect, useRef } from "react";

// import { ethers } from "ethers";
// import {CONTRACT_ADDRESS,
//   CONTRACT_ABI,
//   TOKEN_ADDRESS,
//   TOKEN_ABI,
// } from "./contractConfig";

// export default function SubscriptionApp() {
//   const [account, setAccount] = useState(null);
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [history, setHistory] = useState([]);
//   const [txStatus, setTxStatus] = useState("");
//   const [status, setStatus] = useState("");
//   const [selectedToken, setSelectedToken] = useState("USDC");
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [analytics, setAnalytics] = useState({ total: 0, totalUSDC: 0 });
//   const [aiInput, setAiInput] = useState("");
//   const [chatMessages, setChatMessages] = useState([]);
//   const chatRef = useRef();

//   const TOKEN_LIST = [
//     { symbol: "USDC", address: TOKEN_ADDRESS, decimals: 6 },
//     { symbol: "DAI", address: "0x0000000000000000000000000000000000000001" },
//     { symbol: "ETH", address: "0x0000000000000000000000000000000000000002" },
//   ];

//   // === Connect Wallet ===
//   async function connectWallet() {
//     try {
//       if (!window.ethereum) {
//         alert("Please install MetaMask!");
//         await playVoice(null, "wallet_connection_failed");
//         return;
//       }
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();
//       const addr = await signer.getAddress();

//       setAccount(addr);
//       setStatus("Wallet connected ✅");
//       await playVoice(addr, "wallet_connected");
//       fetchSubscriptions(addr, provider);
//     } catch (error) {
//       console.error("Wallet connection failed:", error);
//       setStatus("Wallet connection failed ❌");
//       await playVoice(null, "wallet_connection_failed");
//     }
//   }

//   function getContract(signerOrProvider) {
//     return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
//   }

//   function getTokenContract(signerOrProvider) {
//     return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signerOrProvider);
//   }

//   // === Date Helper ===
//   function formatDate(ts) {
//     const date = new Date(Number(ts) * 1000);
//     const daysLeft = Math.ceil((date - Date.now()) / (1000 * 60 * 60 * 24));
//     return daysLeft > 0
//       ? `${daysLeft} days left (${date.toLocaleDateString()})`
//       : `Expired on ${date.toLocaleDateString()}`;
//   }

//   // === Fetch Subscriptions ===
//   async function fetchSubscriptions(address, provider = null) {
//     try {
//       provider = provider || new ethers.BrowserProvider(window.ethereum);
//       const contract = getContract(provider);
//       const nextId = await contract.nextSubId();

//       const active = [];
//       const cancelled = [];
//       let totalUSDC = 0;

//       for (let i = 1; i <= nextId; i++) {
//         const sub = await contract.subscriptions(i);
//         if (sub.subscriber.toLowerCase() === address.toLowerCase()) {
//           const formatted = {
//             subId: i,
//             amount: sub.amount,
//             nextDueDate: formatDate(sub.nextDue),
//             active: sub.active,
//           };
//           if (sub.active) {
//             active.push(formatted);
//             totalUSDC += Number(ethers.formatUnits(sub.amount, 6));
//           } else {
//             cancelled.push(formatted);
//           }
//         }
//       }

//       setSubscriptions(active);
//       setHistory(cancelled);
//       setAnalytics({ total: active.length, totalUSDC });
//     } catch (err) {
//       console.error("Fetching subscriptions failed:", err);
//     }
//   }

//   // === Subscribe ===
//   async function handleSubscribe() {
//     if (!account) return alert("Connect your wallet first!");
//     try {
//       setTxStatus("Processing subscription...");
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();

//       const tokenContract = getTokenContract(signer);
//       const amount = ethers.parseUnits("10", 6);
//       const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amount);
//       await approveTx.wait();

//       const contract = getContract(signer);
//       const period = 30 * 24 * 60 * 60;
//       const tx = await contract.createSubscription(
//         account,
//         TOKEN_ADDRESS,
//         amount,
//         period
//       );
//       await tx.wait();

//       setTxStatus("✅ Subscription successful!");
//       await playVoice(account, "subscribed");
//       fetchSubscriptions(account, provider);
//     } catch (error) {
//       if (error.code === "ACTION_REJECTED") {
//         setTxStatus("❌ Transaction cancelled by user.");
//         await playVoice(account, "cancelled");
//         return;
//       }
//       console.error("Subscription error:", error);
//       setTxStatus("❌ Subscription failed.");
//       await playVoice(account, "failed");
//     }
//   }

//   // === Unsubscribe ===
//   async function handleUnsubscribe(subId) {
//     try {
//       setTxStatus("Cancelling subscription...");
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();
//       const contract = getContract(signer);

//       const tx = await contract.cancelSubscription(subId);
//       await tx.wait();

//       setTxStatus("❌ Subscription cancelled");
//       await playVoice(account, "unsubscribed");
//       fetchSubscriptions(account, provider);
//     } catch (error) {
//       console.error("Unsubscribe failed:", error);
//       setTxStatus("❌ Unsubscribe failed");
//     }
//   }

//   // === Voice Feedback ===
//   async function playVoice(address, action) {
//     try {
//       const res = await fetch("http://localhost:5001/speak", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ address, action }),
//       });
//       if (!res.ok) throw new Error("Failed to fetch audio");
//       const audioBlob = await res.blob();
//       const audioUrl = URL.createObjectURL(audioBlob);
//       const audio = new Audio(audioUrl);
//       audio.play();
//     } catch (error) {
//       console.error("Voice generation error:", error);
//     }
//   }

//   // === AI Assistant (Chat + Voice) ===
//   async function askAssistant() {
//     if (!aiInput.trim()) return;
//     const userMsg = aiInput.trim();
//     setChatMessages((msgs) => [...msgs, { role: "user", text: userMsg }]);
//     setAiInput("");

//     try {
//       const aiRes = await fetch("http://localhost:5001/ask-ai", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ query: userMsg }),
//       });

//       const data = await aiRes.json();
//       const reply = data?.reply || "⚠️ No response from assistant.";

//       setChatMessages((msgs) => [...msgs, { role: "ai", text: reply }]);

//       const voiceRes = await fetch("http://localhost:5001/speak", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: reply }),
//       });

//       if (voiceRes.ok) {
//         const audioBlob = await voiceRes.blob();
//         const audioUrl = URL.createObjectURL(audioBlob);
//         const audio = new Audio(audioUrl);
//         audio.play();
//       } else {
//         console.warn("⚠️ Voice playback skipped.");
//       }
//     } catch (err) {
//       console.error("AI Assistant error:", err);
//       setChatMessages((msgs) => [
//         ...msgs,
//         { role: "ai", text: "⚠️ Assistant unavailable." },
//       ]);
//     }
//   }

//   // === UI ===
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 text-white">
//       <h1 className="text-4xl font-bold mb-6">AI Subscription Manager</h1>

//       {!account ? (
//         <button
//           onClick={connectWallet}
//           className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-2xl font-semibold text-lg shadow-lg"
//         >
//           Connect Wallet 🦊
//         </button>
//       ) : (
//         <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
//           <p>
//             Connected: {account.slice(0, 6)}...{account.slice(-4)}
//           </p>

//           {/* Token Dropdown (UI Only) */}
//           <div className="flex gap-2 items-center">
//             <label>Select Token:</label>
//             <select
//               value={selectedToken}
//               onChange={(e) => setSelectedToken(e.target.value)}
//               className="bg-gray-800 text-white px-3 py-1 rounded-lg"
//             >
//               {TOKEN_LIST.map((token) => (
//                 <option key={token.symbol} value={token.symbol}>
//                   {token.symbol}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Tabs */}
//           <div className="flex gap-4 mt-4">
//             {["dashboard", "history", "assistant"].map((tab) => (
//               <button
//                 key={tab}
//                 className={`px-4 py-2 rounded-lg ${
//                   activeTab === tab ? "bg-indigo-600" : "bg-gray-800"
//                 }`}
//                 onClick={() => setActiveTab(tab)}
//               >
//                 {tab === "dashboard"
//                   ? "Dashboard"
//                   : tab === "history"
//                   ? "History"
//                   : "AI Assistant"}
//               </button>
//             ))}
//           </div>

//           {/* Dashboard Tab */}
//           {activeTab === "dashboard" && (
//             <>
//               <button
//                 onClick={handleSubscribe}
//                 className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-2xl font-semibold text-lg shadow-lg"
//               >
//                 Subscribe 💸
//               </button>

//               <div className="mt-6 bg-gray-900 rounded-xl p-4 w-full">
//                 <h2 className="text-xl font-semibold mb-2">
//                   Active Subscriptions ({subscriptions.length})
//                 </h2>
//                 {subscriptions.length === 0 && <p>No active subscriptions.</p>}
//                 {subscriptions.map((sub) => (
//                   <div
//                     key={sub.subId}
//                     className="flex justify-between bg-gray-800 px-3 py-2 rounded-lg mb-2"
//                   >
//                     <div>
//                       <p>
//                         #{sub.subId} —{" "}
//                         {sub.amount
//                           ? `${ethers.formatUnits(sub.amount, 6)} USDC`
//                           : "0 USDC"}
//                       </p>
//                       <p className="text-sm text-gray-400">{sub.nextDueDate}</p>
//                     </div>
//                     <button
//                       onClick={() => handleUnsubscribe(sub.subId)}
//                       className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm"
//                     >
//                       Unsubscribe ❌
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               <div className="bg-gray-900 rounded-xl p-4 w-full mt-4">
//                 <h2 className="text-xl font-semibold mb-2">Analytics</h2>
//                 <p>Total Subscriptions: {analytics.total}</p>
//                 <p>Total Paid: {analytics.totalUSDC.toFixed(2)} USDC</p>
//               </div>
//             </>
//           )}

//           {/* History Tab */}
//           {activeTab === "history" && (
//             <div className="mt-6 bg-gray-900 rounded-xl p-4 w-full">
//               <h2 className="text-xl font-semibold mb-2">
//                 Cancelled / Expired Subscriptions
//               </h2>
//               {history.length === 0 && <p>No past subscriptions.</p>}
//               {history.map((sub) => (
//                 <div
//                   key={sub.subId}
//                   className="bg-gray-800 px-3 py-2 rounded-lg mb-2"
//                 >
//                   <p>
//                     #{sub.subId} — {ethers.formatUnits(sub.amount, 6)} USDC
//                   </p>
//                   <p className="text-sm text-gray-400">
//                     Ended: {sub.nextDueDate}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Assistant Tab */}
//           {activeTab === "assistant" && (
//             <div className="mt-6 bg-gray-900 rounded-xl p-4 w-full flex flex-col h-[400px]">
//               <h2 className="text-xl font-semibold mb-2">AI Assistant 🤖</h2>
//               <div
//                 ref={chatRef}
//                 className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-3 mb-3 space-y-2"
//               >
//                 {chatMessages.length === 0 ? (
//                   <p className="text-gray-400 text-sm text-center mt-10">
//                     👋 Ask me anything about your subscriptions, payments, or renewals.
//                   </p>
//                 ) : (
//                   chatMessages.map((msg, idx) => (
//                     <div
//                       key={idx}
//                       className={`p-2 rounded-lg max-w-[80%] ${
//                         msg.role === "user"
//                           ? "bg-indigo-600 self-end ml-auto"
//                           : "bg-gray-700 self-start"
//                       }`}
//                     >
//                       {msg.text}
//                     </div>
//                   ))
//                 )}
//               </div>

//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={aiInput}
//                   onChange={(e) => setAiInput(e.target.value)}
//                   placeholder="Type your question..."
//                   className="flex-grow bg-gray-800 px-3 py-2 rounded-lg text-white focus:outline-none"
//                   onKeyDown={(e) => e.key === "Enter" && askAssistant()}
//                 />
//                 <button
//                   onClick={askAssistant}
//                   className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
//                 >
//                   Send
//                 </button>
//               </div>
//             </div>
//           )}

//           <p className="mt-4 text-lg">{txStatus}</p>
//           <p className="text-gray-300">{status}</p>
//         </div>
//       )}
//     </div>
//   );
// }




import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  TOKEN_ADDRESS,
  TOKEN_ABI,
} from "./contractConfig";
import { Moon, Sun, Wallet, Zap, History, MessageSquare, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export default function SubscriptionApp() {
  const [account, setAccount] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [txStatus, setTxStatus] = useState("");
  const [status, setStatus] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [aiInput, setAiInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isDark, setIsDark] = useState(true);
  const chatRef = useRef();

  
  async function playVoice(text) {
    if (!text) return;
    try {
      const res = await fetch("http://localhost:5001/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        console.warn("Voice API unavailable - continuing without audio");
        return; // Silently fail without breaking the app
      }
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => console.warn("Audio play failed:", err));
    } catch (err) {
      console.warn("Voice feature disabled:", err.message);
      
    }
  }

  const TOKEN_LIST = [
    { symbol: "USDC", address: TOKEN_ADDRESS, decimals: 6 },
    { symbol: "DAI", address: "0x0000000000000000000000000000000000000001" },
    { symbol: "ETH", address: "0x0000000000000000000000000000000000000002" },
  ];

  const toggleTheme = () => setIsDark(!isDark);

  //Wallet Connected
  async function connectWallet() {
    try {
      if (!window.ethereum) return alert("Install MetaMask first.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
      setStatus("✅ Wallet connected");
      await playVoice("Wallet connected successfully.");
      fetchSubscriptions(addr, provider);
    } catch (error) {
      console.error(error);
      setStatus("❌ Wallet connection failed");
      await playVoice("Wallet connection failed. Please try again.");
    }
  }

  function getContract(signerOrProvider) {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
  }
  function getTokenContract(signerOrProvider) {
    return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signerOrProvider);
  }

  function formatDate(ts) {
    const date = new Date(Number(ts) * 1000);
    const daysLeft = Math.ceil((date - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0
      ? `${daysLeft} days left (${date.toLocaleDateString()})`
      : `Expired on ${date.toLocaleDateString()}`;
  }

  async function fetchSubscriptions(address, provider = null) {
    try {
      provider = provider || new ethers.BrowserProvider(window.ethereum);
      const contract = getContract(provider);
      const nextId = await contract.nextSubId();
      const active = [];
      const cancelled = [];

      for (let i = 1; i <= nextId; i++) {
        const sub = await contract.subscriptions(i);
        if (sub.subscriber.toLowerCase() === address.toLowerCase()) {
          const formatted = {
            subId: i,
            amount: sub.amount,
            nextDueDate: formatDate(sub.nextDue),
            active: sub.active,
          };
          if (sub.active) active.push(formatted);
          else cancelled.push(formatted);
        }
      }

      setSubscriptions(active);
      setHistory(cancelled);
    } catch (err) {
      console.error(err);
    }
  }

  // ===== Subscribe =====
  async function handleSubscribe() {
    if (!account) return alert("Connect wallet first!");
    try {
      setTxStatus("⏳ Processing...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const token = getTokenContract(signer);
      const amount = ethers.parseUnits("10", 6);

      await (await token.approve(CONTRACT_ADDRESS, amount)).wait();
      const contract = getContract(signer);
      await (
        await contract.createSubscription(
          account,
          TOKEN_ADDRESS,
          amount,
          30 * 24 * 60 * 60
        )
      ).wait();

      setTxStatus("✅ Subscribed successfully!");
      await playVoice("Subscription created successfully!");
      fetchSubscriptions(account, provider);
    } catch (e) {
      setTxStatus("❌ Subscription failed");
      await playVoice("Subscription failed. Please try again.");
      console.error(e);
    }
  }

  // ===== Unsubscribe =====
  async function handleUnsubscribe(subId) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      await (await contract.cancelSubscription(subId)).wait();
      await playVoice(`Subscription ${subId} cancelled successfully.`);
      fetchSubscriptions(account, provider);
    } catch (err) {
      await playVoice("Unsubscription failed.");
      console.error(err);
    }
  }

  // ===== AI Assistant =====
  async function askAssistant() {
    if (!aiInput.trim()) return;
    const input = aiInput;
    setAiInput("");
    setChatMessages((m) => [...m, { role: "user", text: input }]);

    try {
      const res = await fetch("http://localhost:5001/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      if (!res.ok) throw new Error("Assistant endpoint error");
      const data = await res.json();

      const reply = data.reply || "I'm here, but couldn't generate a reply.";
      setChatMessages((m) => [...m, { role: "ai", text: reply }]);
      await playVoice(reply);
    } catch (err) {
      console.error(err);
      setChatMessages((m) => [
        ...m,
        { role: "ai", text: "⚠️ Assistant offline or unreachable." },
      ]);
      await playVoice("Assistant is offline. Please try later.");
    }
  }

  return (
    <div
      className={`min-h-screen w-full relative overflow-hidden transition-all duration-700 ${
        isDark
          ? "bg-[#0a0118]"
          : "bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50"
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 ${isDark ? 'bg-purple-600' : 'bg-purple-400'} animate-pulse`}></div>
        <div className={`absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 ${isDark ? 'bg-cyan-600' : 'bg-cyan-400'} animate-pulse`} style={{animationDelay: '1s'}}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10 ${isDark ? 'bg-fuchsia-600' : 'bg-fuchsia-400'} animate-pulse`} style={{animationDelay: '2s'}}></div>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(${isDark ? '#8b5cf6' : '#a78bfa'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#8b5cf6' : '#a78bfa'} 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative z-10 min-h-screen w-full flex flex-col px-6 py-6">
        
        {/* Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`fixed top-6 right-6 ${isDark ? 'bg-white/5' : 'bg-white/80'} backdrop-blur-xl rounded-full p-3 border ${isDark ? 'border-purple-500/30' : 'border-purple-300/50'} shadow-lg hover:shadow-purple-500/30 transition-all z-50`}
        >
          {isDark ? (
            <Sun className="text-yellow-400 w-5 h-5" />
          ) : (
            <Moon className="text-purple-700 w-5 h-5" />
          )}
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8 max-w-7xl mx-auto w-full"
        >
          <div className="flex items-center gap-4 mb-2">
            <motion.div
              animate={{ 
                boxShadow: isDark 
                  ? ['0 0 20px rgba(168,85,247,0.3)', '0 0 40px rgba(168,85,247,0.5)', '0 0 20px rgba(168,85,247,0.3)']
                  : ['0 0 15px rgba(168,85,247,0.2)', '0 0 30px rgba(168,85,247,0.4)', '0 0 15px rgba(168,85,247,0.2)']
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="rounded-full p-2"
            >
              <Zap className={`w-12 h-12 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </motion.div>
            <div>
              <h1 className={`text-4xl md:text-5xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  SubChain
                </span>
              </h1>
              <p className={`text-sm md:text-base ${isDark ? 'text-purple-300' : 'text-purple-700'} font-medium`}>
                Decentralized Subscription Protocol
              </p>
            </div>
          </div>
        </motion.div>

        {/* Wallet Section */}
        {!account ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center flex-1"
          >
            <div className="relative">
              <motion.button
                onClick={connectWallet}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-10 py-5 rounded-2xl font-bold text-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-600 text-white shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3">
                  <Wallet className="w-6 h-6" />
                  <span>Connect Wallet</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 -z-10"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className={`flex-1 w-full max-w-7xl mx-auto ${isDark ? 'bg-white/5' : 'bg-white/90'} backdrop-blur-2xl rounded-3xl border ${isDark ? 'border-purple-500/20' : 'border-purple-300/50'} p-6 shadow-2xl`}
          >
            {/* Connected Wallet Badge */}
            <div className={`flex items-center justify-between mb-6 pb-6 border-b ${isDark ? 'border-purple-500/20' : 'border-purple-300/30'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'} font-semibold uppercase tracking-wider`}>Connected</p>
                  <p className={`font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'} font-medium`}>Active</span>
              </div>
            </div>

            {/* Tabs */}
            <div className={`flex gap-2 mb-6 p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-purple-100/50'}`}>
              {[
                { id: "dashboard", label: "Dashboard", icon: Zap },
                { id: "history", label: "History", icon: History },
                { id: "assistant", label: "AI Assistant", icon: MessageSquare }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? isDark
                          ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg"
                          : "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg"
                        : isDark
                        ? "text-purple-300 hover:text-white"
                        : "text-purple-700 hover:text-purple-900"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <motion.button
                    onClick={handleSubscribe}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-8 py-4 rounded-xl font-bold text-lg text-white shadow-xl hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    Create New Subscription
                  </motion.button>

                  <div className={`${isDark ? 'bg-white/5' : 'bg-purple-50/80'} rounded-2xl p-6 border ${isDark ? 'border-purple-500/20' : 'border-purple-300/30'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Active Subscriptions
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-200 text-purple-700'}`}>
                        {subscriptions.length}
                      </span>
                    </div>
                    
                    {subscriptions.length === 0 ? (
                      <div className={`text-center py-12 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No active subscriptions yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {subscriptions.map((sub) => (
                          <motion.div
                            key={sub.subId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center justify-between ${isDark ? 'bg-white/5' : 'bg-white'} p-4 rounded-xl border ${isDark ? 'border-purple-500/20' : 'border-purple-200'} hover:border-purple-500/50 transition-all duration-300`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                                #{sub.subId}
                              </div>
                              <div>
                                <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {sub.amount
                                    ? `${ethers.formatUnits(sub.amount, 6)} USDC`
                                    : "0 USDC"}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'} font-medium`}>
                                  {sub.nextDueDate}
                                </p>
                              </div>
                            </div>
                            <motion.button
                              onClick={() => handleUnsubscribe(sub.subId)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 rounded-lg text-white font-semibold text-sm flex items-center gap-2 shadow-lg hover:shadow-rose-500/50 transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className={`${isDark ? 'bg-white/5' : 'bg-purple-50/80'} rounded-2xl p-6 border ${isDark ? 'border-purple-500/20' : 'border-purple-300/30'}`}
                >
                  <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Subscription History
                  </h2>
                  {history.length === 0 ? (
                    <div className={`text-center py-12 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No history available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((sub) => (
                        <div
                          key={sub.subId}
                          className={`flex items-center gap-4 ${isDark ? 'bg-white/5' : 'bg-white'} p-4 rounded-xl border ${isDark ? 'border-purple-500/20' : 'border-purple-200'}`}
                        >
                          <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-600'} font-bold`}>
                            #{sub.subId}
                          </div>
                          <div>
                            <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {sub.amount
                                ? `${ethers.formatUnits(sub.amount, 6)} USDC`
                                : "0 USDC"}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {sub.nextDueDate}
                            </p>
                          </div>
                          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
                            Cancelled
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "assistant" && (
                <motion.div
                  key="assistant"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className={`${isDark ? 'bg-white/5' : 'bg-purple-50/80'} backdrop-blur-xl border ${isDark ? 'border-purple-500/20' : 'border-purple-300/30'} rounded-2xl p-6 h-[500px] flex flex-col`}
                >
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-purple-500/20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Assistant</h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
                    {chatMessages.length === 0 ? (
                      <div className={`text-center py-12 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Start a conversation</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            msg.role === "user"
                              ? "ml-auto bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg"
                              : isDark
                              ? "bg-white/10 text-white border border-purple-500/30"
                              : "bg-white text-gray-900 border border-purple-300"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </motion.div>
                      ))
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <input
                      className={`flex-grow ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900'} px-4 py-3 rounded-xl border ${isDark ? 'border-purple-500/30' : 'border-purple-300'} focus:outline-none focus:border-purple-500 transition-all`}
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Ask me anything..."
                      onKeyDown={(e) => e.key === "Enter" && askAssistant()}
                    />
                    <motion.button
                      onClick={askAssistant}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Message */}
            {txStatus && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-xl ${
                  txStatus.includes("✅")
                    ? isDark ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300" : "bg-emerald-100 border border-emerald-300 text-emerald-700"
                    : txStatus.includes("❌")
                    ? isDark ? "bg-red-500/20 border border-red-500/30 text-red-300" : "bg-red-100 border border-red-300 text-red-700"
                    : isDark ? "bg-purple-500/20 border border-purple-500/30 text-purple-300" : "bg-purple-100 border border-purple-300 text-purple-700"
                } font-medium text-center`}
              >
                {txStatus}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}