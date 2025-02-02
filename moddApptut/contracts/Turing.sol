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

    modifier onlyOwnerOrProfessor() {
        require(msg.sender == owner || msg.sender == professor, "Apenas o owner ou a professora podem executar");
        _;
    }

    modifier onlyAuthorized() {
        require(enderecoValido[msg.sender], "Usuario nao autorizado");
        _;
    }

    constructor() ERC20("Turing", "TRN") {

        nomeParaEndereco["nome1"] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        nomeParaEndereco["nome2"] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        nomeParaEndereco["nome3"] = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        nomeParaEndereco["nome4"] = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
        nomeParaEndereco["nome5"] = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;
        nomeParaEndereco["nome6"] = 0x976EA74026E726554dB657fA54763abd0C3a0aa9;
        nomeParaEndereco["nome7"] = 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955;
        nomeParaEndereco["nome8"] = 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f;
        nomeParaEndereco["nome9"] = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;
        nomeParaEndereco["nome10"] = 0xBcd4042DE499D14e55001CcbB24a551F3b954096;
        nomeParaEndereco["nome11"] = 0x71bE63f3384f5fb98995898A86B02Fb2426c5788;
        nomeParaEndereco["nome12"] = 0xFABB0ac9d68B0B445fB7357272Ff202C5651694a;
        nomeParaEndereco["nome13"] = 0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec;
        nomeParaEndereco["nome14"] = 0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097;
        nomeParaEndereco["nome15"] = 0xcd3B766CCDd6AE721141F452C550Ca635964ce71;
        nomeParaEndereco["nome16"] = 0x2546BcD3c84621e976D8185a91A922aE77ECEc30;
        nomeParaEndereco["nome17"] = 0xbDA5747bFD65F08deb54cb465eB87D40e51B197E;
        nomeParaEndereco["nome18"] = 0xdD2FD4581271e230360230F9337D5c0430Bf44C0;
        nomeParaEndereco["nome19"] = 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199;

        for (uint i = 1; i <= 19; i++) {
            enderecoValido[nomeParaEndereco[string(abi.encodePacked("nome", i))]] = true;
        }
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
        _mint(msg.sender, 0.2 * 1e18);
    }

    function votingOn() external onlyOwnerOrProfessor {
        isVotingOn = true;
    }

    function votingOff() external onlyOwnerOrProfessor {
        isVotingOn = false;
    }
}

