import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun LoginPage(
    onNavigateToHome: () -> Unit,
    onNavigateToSignUp: () -> Unit
) {
    // State Equivalents to React's useState
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var isGoogleLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    val coroutineScope = rememberCoroutineScope()

    // Animation trigger state
    var isVisible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { isVisible = true }

    // Colors mapping to your Tailwind theme
    val slate50 = Color(0xFFF8FAFC)
    val slate100 = Color(0xFFF1F5F9)
    val slate400 = Color(0xFF94A3B8)
    val slate500 = Color(0xFF64748B)
    val slate900 = Color(0xFF0F172A)
    val indigo50 = Color(0xFFEEF2FF)
    val indigo600 = Color(0xFF4F46E5)
    val rose50 = Color(0xFFFFF1F2)
    val rose600 = Color(0xFFE11D48)

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color.White
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            AnimatedVisibility(
                visible = isVisible,
                enter = fadeIn(tween(800)) + slideInVertically(tween(800)) { it / 6 }
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Header Section
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(CircleShape)
                            .background(indigo50),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Timeline, // Closest Material icon to 'Activity'
                            contentDescription = "Activity Icon",
                            tint = indigo600,
                            modifier = Modifier.size(32.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    Text(
                        text = "Smart Tracking",
                        fontSize = 30.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Serif,
                        color = slate900
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Log in to your Smart Tracking account.",
                        fontSize = 14.sp,
                        color = slate500
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    // Error Message Banner
                    errorMessage?.let { error ->
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(rose50)
                                .padding(16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = error, color = rose600, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    // Input Fields
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        placeholder = { Text("Email Address", color = slate400) },
                        leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = slate400) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = slate50,
                            unfocusedContainerColor = slate50,
                            focusedBorderColor = indigo600,
                            unfocusedBorderColor = slate100
                        ),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        placeholder = { Text("Password", color = slate400) },
                        leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = slate400) },
                        visualTransformation = PasswordVisualTransformation(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = slate50,
                            unfocusedContainerColor = slate50,
                            focusedBorderColor = indigo600,
                            unfocusedBorderColor = slate100
                        ),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    // Buttons Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Email Login Button
                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    isLoading = true
                                    errorMessage = null
                                    try {
                                        // TODO: Implement Supabase Auth SignIn
                                        // supabase.gotrue.loginWith(Email) { ... }
                                        delay(1500) // Mocking network request
                                        onNavigateToHome()
                                    } catch (e: Exception) {
                                        errorMessage = e.message ?: "Login failed"
                                    } finally {
                                        isLoading = false
                                    }
                                }
                            },
                            enabled = !isLoading && !isGoogleLoading,
                            colors = ButtonDefaults.buttonColors(containerColor = indigo600),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(56.dp)
                        ) {
                            if (isLoading) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                            } else {
                                Text("LOG IN", fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Icon(Icons.Default.ArrowForward, contentDescription = null)
                            }
                        }

                        // Google Login Button
                        OutlinedButton(
                            onClick = {
                                coroutineScope.launch {
                                    isGoogleLoading = true
                                    errorMessage = null
                                    try {
                                        // TODO: Implement Supabase Google OAuth
                                        delay(1500) // Mocking network request
                                    } catch (e: Exception) {
                                        errorMessage = e.message ?: "Google login failed"
                                    } finally {
                                        isGoogleLoading = false
                                    }
                                }
                            },
                            enabled = !isLoading && !isGoogleLoading,
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier
                                .width(72.dp)
                                .height(56.dp),
                            contentPadding = PaddingValues(0.dp)
                        ) {
                            if (isGoogleLoading) {
                                CircularProgressIndicator(color = indigo600, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                            } else {
                                // Note: You'll need to add a Google vector asset to your drawable folder
                                Text("G", color = Color.DarkGray, fontWeight = FontWeight.Bold, fontSize = 20.sp) 
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(32.dp))

                    // Footer
                    Row(
                        horizontalArrangement = Arrangement.Center,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Don't have an account? ", color = slate500)
                        Text(
                            text = "Sign Up",
                            color = indigo600,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.clickable { onNavigateToSignUp() }
                        )
                    }
                }
            }
        }
    }
}
