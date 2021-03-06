import { injected } from '@/lib/web3-react'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { Provider as MulticallProvider } from 'ethcall'
import { observer, useLocalObservable } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { ETHMainnetConfig } from '../../config/ETHMainnetConfig'
import { eventBus } from '../../lib/event'
import { useStore } from '../../store/index'

export const ETHProvider = observer(({ children }) => {
  const { god, lang } = useStore()
  const { chainId, account, activate, active, library, deactivate, error, connector } = useWeb3React<Web3Provider>()

  const store = useLocalObservable(() => ({
    get defaultChain() {
      return ETHMainnetConfig
    },
    logout() {
      deactivate()
      god.eth.connector.latestProvider.clear()
    },
    wrongNetwork() {
      toast.error(lang.t('wrong.network'), { id: 'wrong.network' })
    },
  }))

  useEffect(() => {
    console.log({ chainId })
    if (chainId) {
      if (god.currentNetwork.allowChains.includes(chainId)) {
        god.setChain(chainId)
      }
    } else {
      // god.currentNetwork.chain.setCurrentId(BSCMainnetConfig.chainId);
      // store.wrongNetwork();
    }

    god.currentNetwork.setAccount(account)
    //@ts-ignore
    god.eth.provider = library ? library : god.eth.defaultEthers
    god.eth.signer = library ? library.getSigner() : null

    god.eth.multiCall = new MulticallProvider()
    god.eth.multiCall.provider = god.eth.provider
    god.eth.multiCall.multicall = { address: god.currentChain.info.multicallAddr, block: 0 }
    god.eth.multiCall.multicall2 = { address: god.currentChain.info.multicall2Addr, block: 0 }

    if (account) {
      god.setShowConnecter(false)
      god.currentNetwork.loadBalance()
    }
    god.updateTicker.setValue(god.updateTicker.value + 1)
  }, [god, library, chainId, account, active, error])

  useEffect(() => {
    if (activate && god.eth.connector.latestProvider.value) {
      if (god.eth.connector.latestProvider.value == 'inject') {
        activate(injected)
      }
    }
  }, [activate, god.eth.connector.latestProvider.value])

  useEffect(() => {
    eventBus.addListener('wallet.logout', store.logout)
    return () => {
      eventBus.removeListener('wallet.logout', store.logout)
    }
  }, [])

  return <></>
})
