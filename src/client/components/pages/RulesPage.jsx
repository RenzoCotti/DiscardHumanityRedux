import React from "react";

const RulesPage = () => {
  return (
    <React.Fragment>
      <div className="flex-column">
        <div className="title">Rules</div>
        <div>Each player draws 10 white cards.</div>
        <div>A black card is drawn from the deck.</div>
        <div>The players then have to pick the most outrageous/horrible white card combination they manage to.</div>
        <div>After that, if playing in Tsar mode, the Tsar will pick the best combination in their opinion.</div>
        <div>If playing in Democracy mode, the users will choose democratically a card.</div>
        <div>The winner then gets a point.</div>
        <div>The cards played get discarded, everybody draws back up to 10 cards, and a new black card is drawn.</div>
        <div>The game continues like this until the end.</div>
        <br />
        <div className="title">Game options</div>
        <div><span className="sub-title">Ending Turns/Score:</span> the game ends when either the turns or the score has been reached. </div>
        <div><span className="sub-title">Ending Haiku:</span> when tired of playing, choose End game and play the Make a haiku card. The best combination wins the game. </div>
        <div><span className="sub-title">Meritocracy:</span> the player that wins the round becomes the Tsar.</div>
      </div>
    </React.Fragment>
  );
};
export default RulesPage;
