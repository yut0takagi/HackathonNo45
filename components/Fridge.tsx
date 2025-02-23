import styles from "./Fridge.module.scss";

export type FridgeProps = {
    height?: number
    width?: number
    children?: React.ReactNode;
}
const Fridge = ({ height = 400, width = 280, children}: FridgeProps) => {
    return (
        <>
            <div className={styles.fridge} style={{ width: width, height: height}}>
                {children}
            </div>
        </>
    );
}

export default Fridge;