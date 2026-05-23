import { useState } from "react";

import {
    Alert,
    Button,
    SafeAreaView,
    Text,
    TextInput,
    View,
} from "react-native";

import { supabase } from "../lib/supabase";

export default function AuthScreen() {
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    async function handleSignup() {
        try {
            setLoading(true);

            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                Alert.alert(error.message);

                return;
            }

            Alert.alert("Signup successful");
        } catch (error) {
            Alert.alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function handleLogin() {
        try {
            setLoading(true);

            const { error } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

            if (error) {
                Alert.alert(error.message);

                return;
            }

            Alert.alert("Login successful");
        } catch (error) {
            Alert.alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView
            style={{
                flex: 1,
                justifyContent: "center",
                padding: 24,
                backgroundColor: "black",
            }}
        >
            <Text
                style={{
                    color: "white",
                    fontSize: 32,
                    fontWeight: "bold",
                    marginBottom: 32,
                }}
            >
                Divvy
            </Text>

            <TextInput
                placeholder="Email"
                placeholderTextColor="gray"
                value={email}
                onChangeText={setEmail}
                style={{
                    borderWidth: 1,
                    borderColor: "gray",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 16,
                    color: "white",
                }}
            />

            <TextInput
                placeholder="Password"
                placeholderTextColor="gray"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{
                    borderWidth: 1,
                    borderColor: "gray",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 24,
                    color: "white",
                }}
            />

            <View>
                <Button
                    title={
                        loading ? "Loading..." : "Sign Up"
                    }
                    onPress={handleSignup}
                />

                <Button
                    title={
                        loading ? "Loading..." : "Login"
                    }
                    onPress={handleLogin}
                />
            </View>
        </SafeAreaView>
    );
}