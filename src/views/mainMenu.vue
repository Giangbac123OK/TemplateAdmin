<script setup>
import { ref, onMounted } from 'vue';

const isSidebarOpen = ref(true);

const stats = ref([
  {
    title: 'Total User',
    value: '40,689',
    icon: '👤',
    change: '+8.5%',
    description: 'Up from yesterday',
    color: '#FF6F61',
  },
  {
    title: 'Total Order',
    value: '10,293',
    icon: '📦',
    change: '+1.3%',
    description: 'Up from past week',
    color: '#C10C99',
  },
  {
    title: 'Total Sales',
    value: '$89,000',
    icon: '💵',
    change: '-4.3%',
    description: 'Down from yesterday',
    color: '#FFCB9A',
  },
  {
    title: 'Total Pending',
    value: '2,040',
    icon: '⏳',
    change: '+1.8%',
    description: 'Up from yesterday',
    color: '#6A4C93',
  },
]);

// const lineChart = ref({
//   series: [
//     { 
//         name: 'Sales', 
//         data: [10, 20, 15, 25, 30, 20, 10],
//         labels: {
//             style: {
//                 colors: '#FFFFFF',
//             },
//         },
//     },
//   ],
//   options: {
//     xaxis: { 
//         categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//         labels: {
//             style: {
//                 colors: 'rgba(255, 255, 255, 0.75)',
//             },
//         }, 
//     },
//     yaxis: { 
//         labels: {
//             style: {
//                 colors: 'rgba(255, 255, 255, 0.75)',
//             },
//         }, 
//     },
//     colors: ['#C10C99'],
//   }
// });

// const barChart = ref({
//   series: [
//     { name: 'Revenue', data: [30, 40, 35, 50, 49, 60, 70] },
//   ],
//   options: {
//     xaxis: { 
//         categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//         labels: {
//             style: {
//                 colors: 'rgba(255, 255, 255, 0.75)',
//             },
//         }, 
//     },
//     yaxis: { 
//         labels: {
//             style: {
//                 colors: 'rgba(255, 255, 255, 0.75)',
//             },
//         }, 
//     },
//     colors: ['#FF6F61'],
//   }
// });

// const pieChart = ref({
//   series: [44, 55, 13, 43, 22],
//   options: {
//     colors: ['#C10C99', '#FF6F61', '#FFC107', '#28B5B5', '#8A4FFF'],
//     labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
//     legend: {
//       labels: {
//         colors: 'rgba(255, 255, 255, 0.75)',
//       },
//     },
//   }
// });

const areaChart = ref({
  series: [
    { name: 'Revenue', data: [30, 40, 35, 50, 49, 60, 70] },
  ],
  options: {
    chart: {
      animations: {
          enabled: true,
          speed: 1000,
          animateGradually: {
              enabled: true,
              delay: 200
          },
          dynamicAnimation: {
              enabled: true,
              speed: 400
          }
      }
    },
    xaxis: { 
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        labels: {
            style: {
                colors: 'rgba(255, 255, 255, 0.75)',
            },
        }, 
    },
    yaxis: { 
        labels: {
            style: {
                colors: 'rgba(255, 255, 255, 0.75)',
            },
        }, 
    },
    colors: ['#95227C'],
  }
});

onMounted(() => {
  window.addEventListener('toggle-sidebar', () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  });
});

</script>

<template>
    <div class="main">
      <main :class="{ open: !isSidebarOpen }" class="main-content">
        <h1 style="color: white; margin-bottom: 15px; font-weight: 700;">Dashboard</h1>
        <div class="stats-container">
            <div v-for="stat in stats" :key="stat.title" class="stat-card">
                <div class="stat-info">
                    <div class="stat-main-content">
                        <div>
                            <h4>{{ stat.title }}</h4>
                            <p class="stat-value">{{ stat.value }}</p>
                        </div>
                        <div class="stat-icon" :style="{ backgroundColor: stat.color }">
                            {{ stat.icon }}
                        </div>
                    </div>
                    <div class="stat-change" :style="{ color: stat.color }">
                        {{ stat.change }}
                        <p class="stat-description">{{ stat.description }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="chart-container">
          <h4>Doanh số bán hàng</h4>
          <!-- <apexchart type="line" height="350" :options="lineChart.options" :series="lineChart.series"></apexchart> -->
          <!-- <apexchart type="bar" height="350" :options="barChart.options" :series="barChart.series"></apexchart> -->
          <!-- <apexchart type="pie" height="350" :options="pieChart.options" :series="pieChart.series"></apexchart> -->
          <apexchart type="area" height="350" :options="areaChart.options" :series="areaChart.series"></apexchart>
        </div>
      </main>
    </div>
</template>
  

<style scoped>
.main {
  display: flex;
  background-color: black;
  background: linear-gradient(225deg, hsla(198, 87%, 6%, 1) 0%, hsla(312, 92%, 5%, 1) 42%, hsla(57, 45%, 8%, 1) 100%);
  min-height: 100vh;
}

.main-content {
  margin-top: 60px;
  margin-left: 250px;
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease;
}

.main-content.open {
  margin-left: 0;
  max-width: 100%;
}

.stats-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #2C3E50;
  border-radius: 8px;
  padding: 15px;
  padding-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 15px;
  width: 23.5%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-main-content {
  display: flex;
  justify-content: space-between;
}

.stat-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  width: 100%;
}

.stat-info h4 {
  margin: 0;
  font-weight: bold;
  color: white;
}

.stat-value {
  font-size: 1.5rem;
  margin: 5px 0;
  color: white;
}

.stat-change {
  font-size: 0.9rem;
  display: flex;
  gap: 10px;
}

.stat-description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.chart-container {
  flex-wrap: wrap;
  gap: 20px;
  background-color: #2C3E50;
  border-radius: 8px;
  padding: 10px;
  padding-bottom: 0;
}

.chart-container h4 {
  color: white;
  text-align: left;
  margin-left: 15px;
}

apexchart {
  flex: 1;
  max-width: 400px;
}

</style>

