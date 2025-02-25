import { Button, Col, message, Row, Skeleton } from "antd";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import AbilityBar from "../components/AbilityBar.jsx";
import HeroContext from "../components/context/HeroContext.jsx";
import { getHeroProfile, updateHeroProfile } from "../utils/api";

const StyledSavedArea = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  height: 100%;
  .rest {
    font-size: 1.2rem;
    margin-bottom: 10px;
    span {
      display: inline-block;
      font-size: 2rem;
      min-width: 50px;
    }
  }
`;

const StyledButton = styled(Button)`
  background: #910505;
  border: 2px solid #910505;
  color: white;
  border-radius: 5px;
  width: 100%;
  font-size: 1.5rem;
  height: auto;
  :hover,
  :focus {
    border: 2px solid #910505;
    color: #910505;
  }
`;
const StyledProfile = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
`;

const StyledError = styled.div`
  text-align: center;
  font-size: 2rem;
`;
const HeroProfilePage = () => {
  const { heroId } = useParams();
  const [abilities, setAbilities] = useState({});
  const [restPoints, setRestPoints] = useState(0);
  const [ui, setUi] = useState("Loading");
  const { heroesPreSave, setHeroPreSave } = useContext(HeroContext);

  useEffect(() => {
    if (heroesPreSave[heroId]) {
      console.log("heroesPreSave", heroesPreSave);
      const { rest, ...ability } = heroesPreSave[heroId];
      setRestPoints(rest);
      setAbilities(ability);
      setUi("OK");
    } else {
      setUi("Loading");
      getHeroProfile(heroId)
        .then((resp) => {
          setHeroPreSave({
            ...heroesPreSave,
            [heroId]: { ...resp, rest: 0 },
          });
          setAbilities(resp);
          setRestPoints(0);
          setUi("OK");
        })
        .catch((err) => {
          console.log("er", err);
          setUi("Error");
        });
    }
  }, [heroId]);

  const onSave = () => {
    if (restPoints === 0) {
      updateHeroProfile(heroId, abilities)
        .then((resp) => {
          console.log(resp);
          if (resp === "OK") message.success("儲存成功！");
        })
        .catch((err) => {
          console.log("err", err);
          message.error("OOPS!某地方出錯了");
        });
    } else {
      message.error("剩餘點數必須為零");
    }
  };

  const handlePlusPoint = ({ ability, points }) => {
    if (restPoints > 0) {
      setRestPoints((pre) => pre - 1);
      setAbilities({ ...abilities, [ability]: points + 1 });
      setHeroPreSave({
        ...heroesPreSave,
        [heroId]: { ...abilities, [ability]: points + 1, rest: restPoints - 1 },
      });
      console.log("her");
    } else {
      message.error("你沒有剩餘點數喔ＱＱ");
    }
  };

  const handleMinusPoint = ({ ability, points }) => {
    if (points > 0) {
      setRestPoints((pre) => pre + 1);
      setAbilities({ ...abilities, [ability]: points - 1 });
      setHeroPreSave({
        ...heroesPreSave,
        [heroId]: { ...abilities, [ability]: points - 1, rest: restPoints + 1 },
      });
    } else {
      message.error("點數不得為負");
    }
  };
  switch (ui) {
    case "Loading":
      return (
        <StyledProfile>
          <Skeleton />
        </StyledProfile>
      );
    case "OK":
      return (
        <StyledProfile>
          <Row>
            <Col xs={24} sm={12}>
              {Object.entries(abilities).map(([ability, points]) => {
                return (
                  <AbilityBar
                    key={ability}
                    ability={ability}
                    points={points}
                    onPlus={() => handlePlusPoint({ ability, points })}
                    onMinus={() => handleMinusPoint({ ability, points })}
                  ></AbilityBar>
                );
              })}
            </Col>
            <Col xs={24} sm={12}>
              <StyledSavedArea>
                <div>
                  <div className="rest">
                    剩餘點數：
                    <span> {restPoints}</span>
                  </div>
                  <div>
                    <StyledButton onClick={onSave}>儲存</StyledButton>
                  </div>
                </div>
              </StyledSavedArea>
            </Col>
          </Row>
        </StyledProfile>
      );
    case "Error":
      return (
        <StyledProfile>
          <StyledError>
            Sorry! <br /> Could Not Find Hero Profile At Index {heroId}.
          </StyledError>
        </StyledProfile>
      );

    default:
      return (
        <StyledProfile>
          <Skeleton />
        </StyledProfile>
      );
  }
};

export default HeroProfilePage;
