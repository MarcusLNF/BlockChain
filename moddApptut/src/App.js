import './App.css';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import TokenArtifact from "./artifacts/contracts/Turing.sol/Turing.json";

const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [tokenData, setTokenData] = useState({});
  const [amount, setAmount] = useState("");
  const [codinome, setCodinome] = useState("");
  const [ranking, setRanking] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  async function _initializeContract(init) {
    return new ethers.Contract(tokenAddress, TokenArtifact.abi, init);
  }

  async function _getTokenData() {
    const contract = await _initializeContract(signer);
    const name = await contract.name();
    const symbol = await contract.symbol();
    setTokenData({ name, symbol });
  }

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function issueToken() {
    if (!codinome || !amount) return alert("Preencha todos os campos!");
    await requestAccount();
    const contract = await _initializeContract(signer);
    const tx = await contract.issueToken(codinome, ethers.utils.parseEther(amount));
    await tx.wait();
    alert("Tokens emitidos com sucesso!");
    fetchRanking();
  }

  async function vote() {
    if (!codinome || !amount) return alert("Preencha todos os campos!");
    await requestAccount();
    const contract = await _initializeContract(signer);
    const tx = await contract.vote(codinome, ethers.utils.parseEther(amount));
    await tx.wait();
    alert("Voto computado!");
    fetchRanking();
  }

  async function votingOn() {
    await requestAccount();
    const contract = await _initializeContract(signer);
    await contract.votingOn();
    alert("Votação ativada!");
  }

  async function votingOff() {
    await requestAccount();
    const contract = await _initializeContract(signer);
    await contract.votingOff();
    alert("Votação desativada!");
  }

  async function fetchRanking() {
    const contract = await _initializeContract(provider);
    const accountList = Object.keys(TokenArtifact.abi).filter(name => name.startsWith("nome"));
    const balances = await Promise.all(
      accountList.map(async (nome) => {
        const address = await contract.nomeParaEndereco(nome);
        const balance = await contract.balanceOf(address);
        return { nome, balance: parseFloat(ethers.utils.formatEther(balance)) };
      })
    );
    balances.sort((a, b) => b.balance - a.balance);
    setRanking(balances);
  }

  useEffect(() => {
    fetchRanking();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={_getTokenData}>Get Token Data</button>
        <h1>{tokenData.name} ({tokenData.symbol})</h1>
        
        <h2>Emitir Tokens</h2>
        <input onChange={e => setCodinome(e.target.value)} placeholder="Codinome" />
        <input onChange={e => setAmount(e.target.value)} placeholder="Quantidade" type="number" />
        <button onClick={issueToken}>Emitir Tokens</button>
        
        <h2>Votar</h2>
        <button onClick={vote}>Votar</button>
        
        <h2>Controle de Votação</h2>
        <button onClick={votingOn}>Ativar Votação</button>
        <button onClick={votingOff}>Desativar Votação</button>

        <h2>Ranking</h2>
        <ul>
          {ranking.map((user, index) => (
            <li key={index}>{user.nome}: {user.balance} Turings</li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
