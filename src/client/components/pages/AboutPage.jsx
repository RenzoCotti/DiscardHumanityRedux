import React from "react";

const AboutPage = props => (
  <div className="secondary-container">
    <div className="super-title padded-bottom">About</div>

    <div className="about">
      Discard Humanity Redux is a remake of the original Discard Humanity made
      by Amedeo Zucchetti, Aron Fiechter, Lara Bruseghini, Renzo Cotti and
      Valerie Burgener.
      <h2>Original Credits</h2>
      Developers of the platform:
      <ul>
        <li>
          <a href="http://atelier.inf.unisi.ch/~brusel">Lara Bruseghini</a>
        </li>
        <li>
          <a href="http://atelier.inf.unisi.ch/~burgev">Valerie Burgener</a>
        </li>
        <li>
          <a href="http://www.renzocotti.com">Renzo Cotti</a>
        </li>
        <li>
          <a href="http://atelier.inf.unisi.ch/~fiecha">Aron Fiechter</a>
        </li>
        <li>
          <a href="http://atelier.inf.unisi.ch/~zuccha">Amedeo Zucchetti</a>
        </li>
      </ul>
      <p>
        JSON Files used for the database can be found here:
        <a href="http://www.crhallberg.com/cah/json">JSON Against Humanity</a>.
        The decks have been modified to make them compatible with our platform
        (removed pick 3 cards and added underscores where necessary). The
        "Internet Pack" is composed by the Official World Wide Web Pack and
        "Hackers Against Humanity"; The "Fantasy and D&amp;D" is composed by the
        Official Fantasy Pack and the "Grognards Against Humanity (RPG fandom
        pack)"; The Totally Censored Deck is just a censored version of the
        Official Expansions 4-6.
      </p>
      <p>
        Crown icon can be found on this website:
        <a href="https://icons8.com/license/">Icons8.com</a>
      </p>
      By using this platform, you agree not to consider us, the authors, liable
      for any offence caused to you. Enjoy!
      <p id="footer">
        <a href="https://www.cardsagainsthumanity.com/">
          Card against Humanity
        </a>{" "}
        used under a
        <a href="https://creativecommons.org/licenses/by-nc-sa/2.0/">
          Creative Commons BY-NC-SA 2.0 license
        </a>
        . Discard Humanity distributed under a
        <a href="https://creativecommons.org/licenses/by-nc-sa/2.0/">
          Creative Commons BY-NC-SA 2.0 license
        </a>
        . “Cards Against Humanity” is a trademark of Cards Against Humanity LLC.
      </p>
      <div className="sub-title">Powered by React/Redux and Node.js</div>
    </div>
  </div>
);
export default AboutPage;
