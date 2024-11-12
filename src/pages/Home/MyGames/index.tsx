/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-23 18:23:11
 * @FilePath: \speed\src\pages\Home\MyGames\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyGames } from "@/common/utils";
import "./style.scss";
import GameCard from "@/containers/came-card";

import fanhuiIcon from "@/assets/images/common/fanhui.svg";

const MyGames: React.FC = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState<any>(0);
  const [gamesList, setGamesList] = useState([]);

  useEffect(() => {
    setGamesList(getMyGames());
  }, [status]);

  return (
    <div className="my-games-module">
      <div className="back-box">
        <img
          src={fanhuiIcon}
          alt=""
          className="back"
          onClick={() => navigate("/home")}
        />
        <div className="games">我的游戏 ({gamesList?.length})</div>
      </div>
      <div id="myScrollableDiv" className="game-list">
        {gamesList?.length > 0 && (
          <GameCard
            options={gamesList}
            locationType={"myGame"}
            triggerDataUpdate={() => setStatus(status + 1)}
          />
        )}
      </div>
    </div>
  );
};

export default MyGames;
