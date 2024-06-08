/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-08 19:26:59
 * @FilePath: \speed\src\pages\Home\MyGames\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getMyGames } from "@/common/utils";

import "./style.scss";
import GameCard from "../GameCard";

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
        <div className="back" onClick={() => navigate("/home")}>
          <LeftOutlined /> 返回
        </div>
        <div className="games">我的游戏 ({gamesList?.length})</div>
      </div>
      <div className="game-list">
        {gamesList?.length > 0 && (
          <GameCard
            options={gamesList}
            locationType={"my-game"}
            triggerDataUpdate={() => setStatus(status + 1)}
          />
        )}
      </div>
    </div>
  );
};

export default MyGames;
