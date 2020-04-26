import React from "react";
import Navbar from "../general/Navbar";


const AboutPage = () => (
  <React.Fragment>
    <Navbar />
    <div className="main-container">

      <div className="about">
        <div className="title">Author&apos;s note</div>
          Discard Humanity Redux is a remake from scratch of an old university group project. <br />
          I was tired of not having it up and running, so I remade it.<br />
          Have fun! c:
        <br />
      - Renzo<br />
        <div className="sub-title">Powered by React/Redux and Node.js</div>
        <br />
        <br />
      Original developers of the platform:
        <br />
        <a href="https://github.com/larabr">larabr</a>, {" "}
        <a href="https://github.com/lazy-val-b">Valerie Burgener</a>, {" "}
        <a href="http://www.renzocotti.com">Renzo Cotti</a>, {" "}
        <a href="http://aron.fiechter.gitlab.io/">Aron Fiechter</a>, {" "}
        <a href="https://github.com/zuccha">Amedeo Zucchetti</a>, {" "}
        <br />

        <div style={{ color: "red" }}>
          By using this platform, you agree not to consider the authors of Discard Humanity liable for any offence caused to you. Enjoy!
        </div>
        <br />

        <div>
          <a href="https://www.cardsagainsthumanity.com/">Card against Humanity{" "}</a> used under a
          <a href="https://creativecommons.org/licenses/by-nc-sa/2.0/">{" "}Creative Commons BY-NC-SA 2.0 license</a>
          . Discard Humanity distributed under a
          <a href="https://creativecommons.org/licenses/by-nc-sa/2.0/">{" "}Creative Commons BY-NC-SA 2.0 license</a>
          . “Cards Against Humanity” is a trademark of Cards Against Humanity LLC.
        </div>
        <br />
        <div>
          JSON Files used for the database can be found here:
          <a href="http://www.crhallberg.com/cah/json"> JSON Against Humanity</a>.
          <br />
        </div>
        <div>
          The &quot;Internet Pack&quot; is composed by the Official World Wide Web Pack and &quot;Hackers Against Humanity&quot;.
          <br />
          The &quot;Fantasy and D&amp;D&quot; is composed by the Official Fantasy Pack and the &quot;Grognards Against Humanity (RPG fandom pack)&quot;.
          <br />
          The Totally Censored Deck is just a censored version of the Official Expansions 4-6, made in order to present the project in front our university :v
        </div>
        <br />

        <div>P.S. Special thanks to my beta testers Zoss, rx6pe, blackwazaa & inqui.</div>
      </div>
    </div>
  </React.Fragment >

);
export default AboutPage;
