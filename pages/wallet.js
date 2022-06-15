import React, { useState, useEffect, Fragment } from "react";
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import Registry from "../contracts/Registry.json";

import { Magic } from 'magic-sdk';
import { ethers, Contract, Wallet, utils } from 'ethers';

export default function Home() {
  let [chain, setChain] = useState(undefined);
  let [symbol, setSymbol] = useState(undefined);
  let [logo, setLogo] = useState(undefined);
  let [price, setPrice] = useState(undefined)
  let [provider, setProvider] = useState(undefined);
  let [signer, setSigner] = useState(undefined);
  let [address, setAddress] = useState(undefined);
  let [registry, setRegistry] = useState(undefined);

  let [balance, setBalance] = useState(undefined);
  let [posts, setPosts] = useState(undefined);
  

  useEffect(() => {
    const init = async () => {

      const customNodeOptions = {
        rpcUrl: 'http://localhost:8545', // Your own node URL
        chainId: 1337, // Your own node's chainId
      };
      const magic = new Magic('MAGIC_LINK_PK', {
        network: customNodeOptions,
      });
      const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      const registry = new Contract(
        '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Contract Address
        Registry.abi,
        signer
      );

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setRegistry(registry);
      setBalance(utils.formatEther(await signer.getBalance()))
    };
    init();
  }, []);

  async function chooseChain(chain, symbol, price, e) {
    e.preventDefault();
    setChain(chain);
    setSymbol(symbol);
    setPrice(price);
    if (chain == "Peach") {
      setLogo("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/325/peach_1f351.png");
    } else {
      setLogo("/" + chain.toLowerCase() + ".svg");
    }
  }

  function resetChain(e) {
    e.preventDefault();
    setChain(undefined);
  }
  
  async function buyTokens(e) {
    e.preventDefault();
    const faucet = new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
    const tx = {
      to: address,
      value: utils.parseEther("0.1"),
    };
    await faucet.signTransaction(tx);
    console.log(await faucet.sendTransaction(tx));
    setBalance(utils.formatEther(await signer.getBalance()))
    console.log("Transferred 0.1", symbol);
    console.log("New balance:", utils.formatEther(await signer.getBalance()), symbol);
  }

  async function fetchPosts(e) {
    e.preventDefault();
    posts = await registry.viewPosts(address)
    setPosts(posts);
  }

  function backToAssets(e) {
    e.preventDefault();
    setPosts(undefined);
  }

  async function handleMint(e) {
    e.preventDefault();
    let result = await registry.createPost('/Cubist_Example.png', address, []);
    console.log("Post Minted Successfully!");
    console.log(result);
    setPosts(await registry.viewPosts(address));
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Peach</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/325/peach_1f351.png" />
      </Head>
      <script
        src="https://auth.magic.link/pnp/callback"
        data-magic-publishable-api-key="pk_live_FAF905554D7C9B98">
      </script>

      <main className={styles.main}>
      {chain === undefined ?
        <div className={styles.createAccount}>
          <Image src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/325/peach_1f351.png" width={60} height={60} />
          <h1 className={styles.title}>Congratulations!</h1>
          <p className={styles.walletCreated}>You've created your <a target="_blank" href="https://peach.builders">Peach</a> wallet</p>

          <div className={styles.airdrop}>
            <h3 className={styles.chooseReward}>Choose a chain</h3>
            <button className={styles.pch} onClick={(e) => chooseChain("Peach", "PCH", 99.99, e)}>
              <div>
                <Image src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/325/peach_1f351.png" width={15} height={15} />
                <p>Peach</p>
              </div>
              <p>FREE</p>
            </button>
            <button className={styles.eth} onClick={(e) => chooseChain("Ethereum", "ETH", 1676.72, e)}>
              <div>
                <Image src="/ethereum.svg" width={15} height={15} />
                <p>Ethereum</p>
              </div>
              <p>~ $2.30</p>
            </button>
            <button className={styles.avax} onClick={(e) => chooseChain("Avalanche", "AVAX", 22.35, e)}>
              <div>
                <Image src="/avalanche.svg" width={15} height={15} />
                <p>Avalanche</p>
              </div>
              <p>~ $0.014</p>
            </button>
            <button className={styles.matic} onClick={(e) => chooseChain("Polygon", "MATIC", 0.60, e)}>
              <div>
                <Image src="/polygon.svg" width={15} height={15} />
                <p>Polygon</p>
              </div>
              <p>~ $0.0007</p>
            </button>
            <button className={styles.eth} onClick={(e) => chooseChain("Harmony", "ONE", 0.036, e)}>
              <div>
                <Image src="/harmony.svg" width={15} height={15} />
                <p>Harmony</p>
              </div>
              <p>~ $0.00003</p>
            </button>
            <p className={styles.useFunds}>*Transaction Fees Are Averaged Estimates</p>
          </div>
        </div> 
        : 
        <Fragment>
        {posts == undefined ? 
        <div className={styles.displayAssets}>
          <button className={styles.back} onClick={resetChain}>&#10229;</button>
          <Image src={logo} width={60} height={60} />
          <h2>{chain}</h2>
          <p>{symbol}</p>
          <h1>${(balance * price).toFixed(2)}</h1>
          <div className={styles.token}>
            <div>
              <Image src={logo} width={15} height={15} />
              <p>{balance} {symbol}</p>
            </div>
            <p>${(balance * price).toFixed(2)}</p>
          </div>
          <div className={styles.token}>
            <div>
              <Image src='/usdc.svg' width={15} height={15} />
              <p>0 USDC</p>
            </div>
            <p>$0.00</p>
          </div>
          <button className={styles.buy} onClick={buyTokens}>Buy tokens</button>
          <button className={styles.nfts} onClick={fetchPosts}>
            <p>{chain} NFTs</p>
            <p>&#10230;</p>
          </button>
          <button className={styles.nfts}>
            <p>View my {chain} Room</p>
            <p>&#10230;</p>
          </button>
        </div> : 
        <div className={styles.viewNFTs}>
          <button className={styles.back} onClick={backToAssets}>&#10229;</button>
          <Image src={logo} width={60} height={60} />
          <h2>{chain} NFTs</h2>
          <div className={styles.posts}>
            {posts.length == 0 ? 
            <div className={styles.emptyFrame}>
              <p>No Posts Created Yet</p>
            </div> : 
            <div className={styles.frame}>
              <Image src={posts[0][0]} width={220} height={220} />
              <div className={styles.description}>
                <p>Cubist Parrot Cage</p>
                <p>100 PCH</p>
              </div>
            </div>}
            <button className={styles.mint} onClick={handleMint}>Mint</button>
            <button className={styles.browse}>Browse</button>
          </div>
        </div>
        }
        </Fragment>}
      </main>
    </div>
  )
}
