import './App.css';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import TokenArtifact from "./artifacts/contracts/Turing.sol/Turing.json";

const tokenAddress = "0xb303857e4a80bd81c526d9e4e94d83c1994030cb";

function App() {
  const [tokenData, setTokenData] = useState({ name: "", symbol: "" });
  const [voteCodinome, setVoteCodinome] = useState("");
  const [voteAmount, setVoteAmount] = useState("");
  
  const [issueCodinome, setIssueCodinome] = useState("");
  const [issueAmount, setIssueAmount] = useState("");
  
  const [ranking, setRanking] = useState([]);
  const [isVotingOn, setIsVotingOn] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setProvider(provider);
        setSigner(signer);
        setIsConnected(true);
        fetchTokenData(signer);
        fetchRanking(provider);
        fetchVotingStatus(provider);
      } catch (error) {
        console.error("Erro ao conectar ao MetaMask:", error);
        alert("Erro ao conectar ao MetaMask. Verifique o console para mais detalhes.");
      }
    } else {
      alert("Por favor, instale o MetaMask!");
    }
  };

  async function _initializeContract(init) {
    return new ethers.Contract(tokenAddress, TokenArtifact.abi, init);
  }

  async function fetchTokenData(signer) {
    try {
      const contract = await _initializeContract(signer);
      const name = await contract.name();
      const symbol = await contract.symbol();
      setTokenData({ name, symbol });
    } catch (error) {
      console.error("Erro ao buscar dados do token:", error);
      alert("Erro ao buscar dados do token. Verifique o console para mais detalhes.");
    }
  }

  async function issueToken() {
    if (!issueCodinome || !issueAmount) return alert("Preencha todos os campos!");
    try {
      const contract = await _initializeContract(signer);
      const amountInSaTuring = ethers.utils.parseUnits(issueAmount, 18);
      const tx = await contract.issueToken(issueCodinome, amountInSaTuring);
      await tx.wait();
      alert("Tokens emitidos com sucesso!");
      fetchRanking(provider);
    } catch (error) {
      console.error("Erro ao emitir tokens:", error);
      alert("Erro ao emitir tokens. Verifique o console para mais detalhes.");
    }
  }

  async function vote() {
    if (!voteCodinome || !voteAmount) return alert("Preencha todos os campos!");
    try {
      const contract = await _initializeContract(signer);
      const amountInSaTuring = ethers.utils.parseUnits(voteAmount, 18);
      const tx = await contract.vote(voteCodinome, amountInSaTuring);
      await tx.wait();
      alert("Voto computado!");
      fetchRanking(provider);
    } catch (error) {
      console.error("Erro ao votar:", error);
      alert(`Erro ao votar: ${error.message}`);
    }
  }

  async function votingOn() {
    try {
      const contract = await _initializeContract(signer);
      const tx = await contract.votingOn();
      await tx.wait();
      alert("Votação ativada!");
      fetchVotingStatus(provider);
    } catch (error) {
      console.error("Erro ao ativar votação:", error);
      alert("Erro ao ativar votação. Verifique o console para mais detalhes.");
    }
  }

  async function votingOff() {
    try {
      const contract = await _initializeContract(signer);
      const tx = await contract.votingOff();
      await tx.wait();
      alert("Votação desativada!");
      fetchVotingStatus(provider);
    } catch (error) {
      console.error("Erro ao desativar votação:", error);
      alert("Erro ao desativar votação. Verifique o console para mais detalhes.");
    }
  }

  async function fetchRanking() {
    try {
      if (!signer) return alert("Conecte-se ao MetaMask primeiro!");
  
      const contract = await _initializeContract(signer);
      
      if (!contract.getBalances) {
        console.error("Erro: getBalances não está definida na ABI do contrato!");
        return;
      }
  
      const [codinomes, balances] = await contract.getBalances();
  
      console.log("Dados brutos do contrato:", { codinomes, balances });
  
      if (!codinomes || !balances) {
        console.error("Erro: Resposta inválida do contrato", { codinomes, balances });
        return;
      }
  
      const rankingData = codinomes.map((nome, index) => ({
        nome,
        balance: ethers.BigNumber.from(balances[index] || 0),
      }));
  
      rankingData.sort((a, b) => b.balance.sub(a.balance));
  
      console.log("Ranking final:", rankingData);
  
      setRanking(
        rankingData.map(user => ({
          nome: user.nome,
          balance: ethers.utils.formatUnits(user.balance, 18),
        }))
      );
    } catch (error) {
      console.error("Erro ao buscar ranking:", error);
    }
  }
  
  async function fetchVotingStatus(provider) {
    try {
      const contract = await _initializeContract(provider);
      const status = await contract.isVotingOn();
      setIsVotingOn(status);
    } catch (error) {
      console.error("Erro ao buscar estado da votação:", error);
    }
  }

  useEffect(() => {
    async function loadData() {
      if (signer) {
        await fetchTokenData(signer);
        await fetchRanking();
        await fetchVotingStatus();
      }
    }
    loadData();
  }, [signer]);

  return (
    <div className="App">
      <header className="App-header">
        {!isConnected ? (
          <button onClick={connectMetaMask} className="connect-button">
            Conectar ao MetaMask
          </button>
        ) : (
          <div className="main-container">
            <div className="left-panel">
              <h1>{tokenData.name} ({tokenData.symbol})</h1>
              
              <h2>Emitir Tokens</h2>
              <input onChange={e => setIssueCodinome(e.target.value)} placeholder="Codinome" />
              <input onChange={e => setIssueAmount(e.target.value)} placeholder="Quantidade (em Turings)" type="number" />
              <button onClick={issueToken}>Emitir Tokens</button>

              <h2>Votar</h2>
              <input onChange={e => setVoteCodinome(e.target.value)} placeholder="Codinome" />
              <input onChange={e => setVoteAmount(e.target.value)} placeholder="Quantidade (em Turings)" type="number" />
              <button onClick={vote}>Votar</button>
              
              <h2>Controle de Votação</h2>
              <button onClick={votingOn}>Ativar Votação</button>
              <button onClick={votingOff}>Desativar Votação</button>

              <h2>Estado da Votação: {isVotingOn ? "Ativada" : "Desativada"}</h2>
            </div>

            <div className="right-panel">
              <h2>Ranking</h2>
              <ul>
                {ranking.map((user, index) => (
                  <li key={index}>
                    {user.nome}: {user.balance} Turings
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
