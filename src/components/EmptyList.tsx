import styled from "styled-components";

export const EmptyList = ({
  hasItems,
  bottom,
}: {
  hasItems: boolean;
  bottom: string;
}) => {
  if (hasItems) return null;
  return (
    <ListContainer color={bottom}>
      <h3>Click start to begin and your count history will show up here.</h3>
    </ListContainer>
  );
};

const ListContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.color};
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  height: calc(100% - 400px);
  text-align: center;
  padding: 10px;
`;
