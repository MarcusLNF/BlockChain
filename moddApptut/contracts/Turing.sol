// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Turing is ERC20 {
    address public owner = 0xcfc4422426b110c66EcA4300622715fFfC67CDE6;
    address public professor = 0x502542668aF09fa7aea52174b9965A7799343Df7;
    bool public isVotingOn = true;

    mapping(string => address) public nomeParaEndereco;
    mapping(address => bool) public enderecoValido;
    mapping(address => mapping(string => bool)) public votes;
    string[] public nomes = ["marcus1", "marcus2", "marcus3", "marcus4", "marcus5", "marcus6"];

    modifier onlyOwnerOrProfessor() {
        require(msg.sender == owner || msg.sender == professor, "Apenas o owner ou a professora podem executar");
        _;
    }

    modifier onlyAuthorized() {
        require(enderecoValido[msg.sender], "Usuario nao autorizado");
        _;
    }

    constructor() ERC20("Turing", "TRN") {

        nomeParaEndereco["marcus1"] = 0xaffcae52D32B42A21803774c449D7d437178d4af;
        nomeParaEndereco["marcus2"] = 0xaa928a7d6acAB9e4F9f2c77b25E72fAb5e6D25aa;
        nomeParaEndereco["marcus3"] = 0xa03Fdf08674e2377566b2C8ABF3B3152bA04EDBA;
        nomeParaEndereco["marcus4"] = 0xa04360a53Fa56353f380293A800CD12E33ef5f23;
        nomeParaEndereco["marcus5"] = 0xa056334BA868D8e3B1d439e6e9c4CF3E17f04794;
        nomeParaEndereco["marcus6"] = 0xa0638dad5aCddc37A2011c515e48DEC530bc5fA1;


        enderecoValido[0xaffcae52D32B42A21803774c449D7d437178d4af] = true;
        enderecoValido[0xaa928a7d6acAB9e4F9f2c77b25E72fAb5e6D25aa] = true;
        enderecoValido[0xa03Fdf08674e2377566b2C8ABF3B3152bA04EDBA] = true;
        enderecoValido[0xa04360a53Fa56353f380293A800CD12E33ef5f23] = true;
        enderecoValido[0xa056334BA868D8e3B1d439e6e9c4CF3E17f04794] = true;
        enderecoValido[0xa0638dad5aCddc37A2011c515e48DEC530bc5fA1] = true;
    }

    function addUser(string calldata codinome, address userAddress) external onlyOwnerOrProfessor {
        require(userAddress != address(0), "Endereco invalido");
        require(nomeParaEndereco[codinome] == address(0), "Nome ja cadastrado");
        require(!enderecoValido[userAddress], "Endereco ja cadastrado");

        nomeParaEndereco[codinome] = userAddress;
        enderecoValido[userAddress] = true;
    }

    function issueToken(string calldata codinome, uint256 quantidade) external onlyOwnerOrProfessor {
        require(nomeParaEndereco[codinome] != address(0), "Aluno nao encontrado");
        _mint(nomeParaEndereco[codinome], quantidade);
    }

    function vote(string calldata votedNome, uint256 amount) external onlyAuthorized {
        require(isVotingOn, "Votacao Off");
        require(nomeParaEndereco[votedNome] != address(0), "Aluno nao encontrado");
        require(nomeParaEndereco[votedNome] != msg.sender, "Proibido votar em si mesmo");
        require(!votes[msg.sender][votedNome], "Ja votou nesse aluno");
        require(amount <= 2 * 1e18, "Limite de saTuring ultrapassado");

        votes[msg.sender][votedNome] = true;

        _mint(nomeParaEndereco[votedNome], amount);
        _mint(msg.sender, (2 * 1e17));
    }

    function votingOn() external onlyOwnerOrProfessor {
        isVotingOn = true;
    }

    function votingOff() external onlyOwnerOrProfessor {
        isVotingOn = false;
    }

    function getBalances() public view returns (string[] memory, uint256[] memory) {
        uint256 length = nomes.length;
        
        string[] memory nomesTemp = new string[](length);
        uint256[] memory balances = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            nomesTemp[i] = nomes[i];
            balances[i] = balanceOf(nomeParaEndereco[nomes[i]]);
        }

        return (nomesTemp, balances);
    }
}
