import React from "react";

const AboutPage = () => (
  <div className="secondary-container">
    <div className="about">
      Discard Humanity Redux is a remake of an old university project.
      <div className="sub-title">Powered by React/Redux and Node.js</div>
      <br />
      <br />
      <div className="title">Original Credits</div>
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
      <p style={{ color: "red" }}>
        {" "}
        By using this platform, you agree not to consider us, the authors,
        liable for any offence caused to you. Enjoy!
      </p>
      <p id="footer">
        <a href="https://www.cardsagainsthumanity.com/">
          Card against Humanity
        </a>{" "}
        used under a{" "}
        <a href="https://creativecommons.org/licenses/by-nc-sa/2.0/">
          Creative Commons BY-NC-SA 2.0 license
        </a>
        . Discard Humanity distributed under a{" "}
        <a href="https://creativecommons.org/licenses/by-nc-sa/2.0/">
          Creative Commons BY-NC-SA 2.0 license
        </a>
        . “Cards Against Humanity” is a trademark of Cards Against Humanity LLC.
      </p>
      <p>
        JSON Files used for the database can be found here:
        <a href="http://www.crhallberg.com/cah/json"> JSON Against Humanity</a>.
        <br />
        The decks have been modified to make them compatible with our platform
        (removed pick 3 cards and added underscores where necessary).
        <br />
        The &quot;Internet Pack&quot; is composed by the Official World Wide Web Pack and
        &quot;Hackers Against Humanity&quot;.
        <br /> The &quot;Fantasy and D&amp;D&quot; is composed by the Official Fantasy
        Pack and the &quot;Grognards Against Humanity (RPG fandom pack)&quot;.
        <br />
        The Totally Censored Deck is just a censored version of the Official
        Expansions 4-6, made in order to present the project in front our
        university :v
      </p>
      <p>
        The crown icon can be found on this website:
        <a href="https://icons8.com/license/"> Icons8.com</a>
      </p>
    </div>
  </div>
);
export default AboutPage;
