import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, ViewBase, Image, FlatList } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import GestureRecognizer from 'react-native-swipe-gestures';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from "expo-secure-store";
import { tokenApi } from "../../conf.json"
import * as ImageManipulator from 'expo-image-manipulator';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

export default function App() {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [camera, setCamera] = useState(null)
    const [image, setImage] = useState(null);
    const [send, setSend] = useState(false)
    const [timer, setTimer] = useState(10)
    const [Users, setUsers] = useState([])
    const [selectedId, setSelectedId] = useState()
    const [valueBase64, setValueBase64] = useState()
    const router = useRouter()
    const tokenStore = SecureStore.getItem("token")

    useEffect(() => {
        async function fetchUsers() {
            await fetch('https://snapchat.epidoc.eu/user',
                {
                    method: 'GET',
                    headers:
                    {
                        Authorization: 'Bearer ' + tokenStore,
                        'X-API-Key': tokenApi
                    }
                }
            ).then(
                (res) => {
                    res.json().then((data) => { let arr = data.data; setUsers(arr) })
                }
            )
        }
        fetchUsers()
    }, [])

    async function sendSnap() {

        fetch('https://snapchat.epidoc.eu/snap',
            {
                method: 'POST',
                mode: 'cors',
                headers:
                {
                    'Authorization': 'Bearer ' + tokenStore,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-API-Key': tokenApi
                },
                body:
                    JSON.stringify({
                        to: selectedId,
                        image: "data:image/jpg;base64," + valueBase64,
                        duration: timer
                    })

            }
        ).then((res) => res.json()).then(res => console.log(res))
    }



    const Item = ({ item, onPress, backgroundColor, textColor }) => (
        <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor }]}>
            <Text style={[styles.username, { color: textColor }]}>{item.username}</Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => {
        const backgroundColor = item._id === selectedId ? '#6e3b6e' : '#f9c2ff';
        const color = item._id === selectedId ? 'white' : 'black';

        return (
            <Item
                item={item}
                onPress={() => setSelectedId(item._id)}
                backgroundColor={backgroundColor}
                textColor={color}
            />
        );
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
            base64: true
        });

        setImage(result.assets[0].uri);
        setValueBase64(result.assets[0].base64)
    };

    const takePicture = async () => {
        if (camera) {
            const data = await camera.takePictureAsync(options = { base64: true })

            const resize = await ImageManipulator.manipulateAsync(
                data.uri,
                [{ resize: { width: 640, height: 480 } }]
            )

            const base64 = await ImageManipulator.manipulateAsync(
                resize.uri,
                [],
                { base64: true }
            )
            setImage(data.uri);
            setValueBase64(base64.base64)
        }
    }

    const clearPicture = async () => {
        setImage(null)
    }

    if (image) {
        return (
            <View style={styles.containerimage}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity style={styles.buttonImage} onPress={() => clearPicture()}>
                    <TabBarIcon name="close-outline" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonImageSend} onPress={() => { setSend(true), clearPicture() }}>
                    <TabBarIcon name="arrow-forward-outline" />
                </TouchableOpacity>
            </View>
        )
    }

    if (send) {
        return (
            <View style={styles.container}>
                <FlatList
                    data={Users}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    style={styles.FlatList}
                />
                <View style={styles.buttonContainerSend}>
                    <TouchableOpacity onPress={() => setSend(false)} style={styles.button}>
                        <TabBarIcon name="arrow-back-outline" />
                    </TouchableOpacity>
                    <View style={styles.timerContainer}>
                        <TouchableOpacity onPress={() => setTimer(timer - 1)} style={styles.buttonTimerLeft}>
                            <TabBarIcon name="remove-outline" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonTimer}>
                            <Text>{timer}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTimer(timer + 1)} style={styles.buttonTimerRight}>
                            <TabBarIcon name="add-outline" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.button}
                        onPress={() => {
                            sendSnap()
                            setSend(false)
                        }}>
                        <Text>Send</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <GestureRecognizer
            style={styles.container}
            onSwipeUp={() => pickImageAsync()}
            onSwipeLeft={() => router.replace('/contact')}
            onSwipeRight={() => router.replace('/allSnaps')}
        >
            <CameraView
                style={styles.camera}
                facing={facing}
                ref={ref => setCamera(ref)}
            >
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <TabBarIcon name="repeat-outline" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonTakePicture} onPress={() => takePicture()}>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={pickImageAsync}>
                        <TabBarIcon name="images-outline" />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </GestureRecognizer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    containerimage: {
        height: '100%',
        width: '100%'
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 20,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    buttonContainerSend: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    timerContainer: {
        flexDirection: 'row'
    },
    button: {
        width: 70,
        height: 70,
        backgroundColor: '#FFC0CB88',
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
    },
    buttonTimer: {
        width: 70,
        height: 70,
        backgroundColor: '#FFC0CB88',
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonTimerLeft: {
        width: 70,
        height: 70,
        backgroundColor: '#FFC0CB88',
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
    },
    buttonTimerRight: {
        width: 70,
        height: 70,
        backgroundColor: '#FFC0CB88',
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'red',
    },
    image: {
        height: '100%',
        width: '100%',
        margin: 'auto'
    },
    buttonImage: {
        width: 70,
        height: 70,
        backgroundColor: '#FFC0CB88',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: '5%',
        top: '7%',
    },
    buttonImageSend: {
        width: 70,
        height: 70,
        backgroundColor: '#FFC0CB88',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: '5%',
        bottom: '3%',
    },
    buttonTakePicture: {
        width: 70,
        height: 70,
        borderRadius: 50,
        backgroundColor: 'pink',
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    textButton: {
        fontSize: 20
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    username: {
        fontSize: 20,
        textAlign: 'center'
    },
    FlatList: {
        flex: 1,
        // marginBottom: '10%'
    }
});
