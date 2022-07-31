import smartpy as sp
import random
import time

class Game(sp.Contract):
    def __init__(self):
        self.init(
                    betStore = sp.big_map(tkey=sp.TAddress, tvalue=sp.TNat),
                    # games = sp.big_map(tkey=sp.TString,tvalue=sp.TRecord(players=sp.TList(t=sp.TAddress), bet=sp.TMutez, winner=sp.TInt)),
                    gameKeys = sp.set(t=sp.TString),
                    AddressToBalance = sp.big_map(tkey=sp.TAddress,tvalue=sp.TMutez),
                    WorldToWinner = sp.big_map(tkey=sp.TString,tvalue=sp.TList(sp.TRecord(addressPlayer=sp.TAddress, result=sp.TString)))
                )


    @sp.entry_point
    def transferForChess(self):
        sp.verify(sp.amount >= sp.tez(2),"Send Atleast 2 Tez")
        self.data.AddressToBalance[sp.sender] = sp.amount
    
    @sp.entry_point
    def winnerDeclareChess(self, worldID, result):
        sp.set_type(worldID, sp.TString)
        sp.set_type(result, sp.TString)
        sp.if ~self.data.WorldToWinner.contains(worldID):
            self.data.WorldToWinner[worldID] = []
        self.data.WorldToWinner[worldID].push(sp.record(addressPlayer=sp.sender, result=result))
        sp.if sp.len(self.data.WorldToWinner[worldID]) >= 2:
            winnerAddress = sp.local("winnerAddress", sp.self_address)
            winningAmount = sp.local("winningAmount", sp.tez(0))
            sp.for item in self.data.WorldToWinner[worldID]:
                sp.if item.result == "winner":
                    winnerAddress.value = item.addressPlayer
                winningAmount.value += self.data.AddressToBalance[item.addressPlayer]
                del self.data.AddressToBalance[item.addressPlayer]
            winningAmount.value = sp.split_tokens(winningAmount.value, 80, 100)
            sp.send(winnerAddress.value, winningAmount.value)
            del self.data.WorldToWinner[worldID]

            # self.data.addStore.push(sp.balance)
    @sp.entry_point
    def placeBetDice(self, bet):
        # sp.set_type(bet, sp.TString)
        sp.verify(bet >= 1, "Invalid Number" )
        sp.verify(bet <= 6, "Invalid Number" )
        sp.verify(sp.amount >= sp.tez(2),"Send Atleast 2 Tez for bet")
        r = int(time.time()) % 6 + 1
        self.data.betStore[sp.sender] = r
        winningAmount = sp.local("winningAmount", sp.tez(2))
        sp.if r == bet:
            winningAmount.value = sp.split_tokens(winningAmount.value, 2, 1)
            sp.send(sp.sender, winningAmount.value)

# Tests
if "templates" not in __name__:
    @sp.add_test(name = "Game")
    def test():
        scenario = sp.test_scenario()
        scenario.h1("Tic-Tac-Toe")
        # define a contract
        c1 = Game()
        scenario+=c1
        scenario.table_of_contents()

        alice = sp.test_account("alice")
        bob = sp.test_account("bob")
        c1.transferForChess().run(sender=bob, amount=sp.tez(2))
        c1.transferForChess().run(sender=alice, amount=sp.tez(2))
        c1.placeBetDice(1).run(sender=alice, amount=sp.tez(2))
        c1.placeBetDice(1).run(sender=alice, amount=sp.tez(2))
        # c1.winnerDeclareChess(worldID="aksjdf-sdkfn-skdjf", result="winner").run(sender=alice)
        # c1.winnerDeclareChess(worldID="aksjdf-sdkfn-skdjf", result="looser").run(sender=bob)
        scenario.p("balance").show(alice)

    sp.add_compilation_target("game", Game())
