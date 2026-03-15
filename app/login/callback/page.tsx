import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@Composable
fun AuthCallbackScreen(
    // In Android, you would pass the intercepted Deep Link Intent or URI here,
    // or let a ViewModel handle the state.
    deepLinkUri: android.net.Uri? = null,
    onNavigateToHome: () -> Unit
) {
    val indigo600 = Color(0xFF4F46E5)
    val slate500 = Color(0xFF64748B)

    // LaunchedEffect is the direct Compose equivalent of React's useEffect.
    // Keying it to 'Unit' ensures it runs exactly once when the screen enters the composition.
    LaunchedEffect(Unit) {
        try {
            // TODO: Implement Supabase Kotlin deep link handling.
            // The Supabase Kotlin GoTrue client has a built-in method for this:
            // deepLinkUri?.let { uri -> 
            //     supabase.gotrue.handleDeeplink(uri) 
            // }
            
            // Simulating the network exchange delay
            delay(1500)
            
        } catch (e: Exception) {
            // In production, you'd likely want to surface this to the user via a Snackbar
            println("Error exchanging code for session: ${e.message}")
        } finally {
            // Equivalent to router.push('/')
            onNavigateToHome()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            CircularProgressIndicator(
                modifier = Modifier.size(48.dp),
                color = indigo600,
                strokeWidth = 4.dp,
                // Optional: to match the 'border-t-transparent' look more closely, 
                // you could use a custom sweep gradient, but the default material 
                // spinner is standard and expected on Android.
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "Completing sign in...",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = slate500
            )
        }
    }
}
