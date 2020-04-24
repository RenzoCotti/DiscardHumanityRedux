import React from "react";
import { RANDO_USERNAME, POINTS_FOR_REDRAW } from "../../../server/socket/utils";
const RulesPage = () => {
  return (
    <React.Fragment>
      <div className="flex-column">
        {/* <div className="super-title">Rules</div> */}
        <br />
        <br />
        <div className="title">Game Rules</div>
        <div>Each player draws 10 white cards.</div>
        <div>A black card is drawn from the deck.</div>
        <div>The players then have to pick the most outrageous/horrible white card combination they manage to.</div>
        <div>After that, if playing in Tsar mode, the Tsar will pick the best combination in their opinion.</div>
        <div>If playing in Democracy mode, the users will choose democratically a card.</div>
        <div>The winner then gets a point.</div>
        <div>The cards played get discarded, everybody draws back up to 10 cards, and a new black card is drawn.</div>
        <div>The game continues like this until the end.</div>
        <br />
        <br />

        <div className="title">Game options</div>
        <div className="flex-row flex-wrap">
          <div className="game-options">
            <div className="rules-title">Ending Turns/Score</div>
            <div>The game ends when either the turns or the score has been reached. Boring.</div>
            <div className="rules-title">Ending Haiku</div>
            <div>When tired of playing, choose End game and play the <i>Make a haiku</i> card. The best combination wins the game. No, it&apos;s not the name of a type of sushi.</div>
            <div className="rules-title">Meritocracy</div>
            <div>The player that wins the round becomes the Tsar.</div>
          </div>
          <div className="game-options">
            <div className="rules-title">Hand redrawing</div>
            <div>Allows you to redraw your hand as the Tsar for {POINTS_FOR_REDRAW} points.</div>
            <div className="rules-title">{RANDO_USERNAME}</div>
            <div>Since you don&apos;t have any real friends, {RANDO_USERNAME} is here for you! He will keep you company as you play, and likely prove a better player than you.</div>
            <div className="rules-title">Jolly cards</div>
            <div>Adds to the game some white cards that you can complete as you go. Don&apos;t worry, your card choice is going to suck nontheless.</div>
          </div>
        </div>




      </div>
    </React.Fragment >
  );
};
export default RulesPage;
